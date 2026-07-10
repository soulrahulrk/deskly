"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getTenant } from "@/lib/dal/context";
import { writeAuditLog } from "@/lib/dal/audit";
import { countOwners } from "@/lib/dal/members";
import { can, outranks } from "@/lib/auth/permissions";
import { createToken } from "@/lib/auth/tokens";
import { sendEmail, absoluteUrl } from "@/lib/email";
import { addMemberSchema, changeMemberRoleSchema } from "@/lib/validations/member";
import { fieldErrorsOf } from "@/lib/validations/errors";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { Role } from "@/lib/constants/enums";

const MEMBER_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — an invite link, not an urgent reset

/** Only an Owner may grant Owner or Admin — everyone else caps at Agent/Viewer. */
function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  if (targetRole === "OWNER" || targetRole === "ADMIN") return actorRole === "OWNER";
  return true;
}

/**
 * Who an actor may change the role of, or remove: an Owner may manage anyone
 * but themselves (including peer Owners — enforced separately by the "last
 * owner" guard); everyone else may only manage strictly lower-ranked members.
 */
function canManageMember(actorRole: Role, targetRole: Role): boolean {
  return actorRole === "OWNER" || outranks(actorRole, targetRole);
}

// ──────────────────────────── Add member ─────────────────────────────────

export async function addMemberAction(
  raw: unknown,
): Promise<ActionResult<{ id: string; inviteUrl: string | null }>> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "member:manage")) {
    return fail("You don't have permission to add members.");
  }

  const parsed = addMemberSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }
  const { name, email, role } = parsed.data;

  if (!canAssignRole(user.role as Role, role)) {
    return fail("Only an Owner can add a member as Owner or Admin.", {
      role: ["Only an Owner can assign this role"],
    });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("A user with this email already exists.", {
      email: ["Email already in use"],
    });
  }

  const member = await prisma.user.create({
    data: { name, email, role, orgId, passwordHash: null },
    select: { id: true },
  });

  // No password yet — reuse the password-reset token flow as a "claim your
  // account" link (member sets their own password on first sign-in).
  const { token, tokenHash } = createToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: member.id,
      tokenHash,
      expires: new Date(Date.now() + MEMBER_INVITE_TTL_MS),
    },
  });
  const inviteUrl = absoluteUrl(`/reset-password?token=${token}`);
  const { delivered } = await sendEmail({
    to: email,
    subject: "You've been added to Deskly",
    text: `${user.name ?? "A teammate"} added you to their Deskly workspace as ${role}.\n\nSet your password to get started:\n\n${inviteUrl}\n\nThis link expires in 7 days.`,
  });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "member.invited",
    entity: "User",
    entityId: member.id,
    summary: `Added ${name} (${email}) as ${role}`,
    after: { name, email, role },
  });

  revalidatePath("/settings/members");
  return ok({ id: member.id, inviteUrl: delivered ? null : inviteUrl });
}

// ─────────────────────────── Change member role ──────────────────────────

export async function changeMemberRoleAction(
  memberId: string,
  raw: unknown,
): Promise<ActionResult> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "member:manage")) {
    return fail("You don't have permission to manage members.");
  }
  if (memberId === user.id) {
    return fail("You can't change your own role. Ask another Owner to do this.");
  }

  const parsed = changeMemberRoleSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please choose a valid role.", fieldErrorsOf(parsed.error));
  }
  const { role: newRole } = parsed.data;

  const target = await prisma.user.findFirst({
    where: { id: memberId, orgId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!target) return fail("Member not found.");

  if (!canManageMember(user.role as Role, target.role as Role)) {
    return fail("You can only manage members with a role below your own.");
  }
  if (!canAssignRole(user.role as Role, newRole)) {
    return fail("Only an Owner can assign the Owner or Admin role.");
  }

  if (target.role === "OWNER" && newRole !== "OWNER") {
    const owners = await countOwners(orgId);
    if (owners <= 1) {
      return fail("This is the only Owner — promote someone else first.");
    }
  }

  await prisma.user.update({ where: { id: memberId }, data: { role: newRole } });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "member.role_changed",
    entity: "User",
    entityId: memberId,
    summary: `Changed ${target.name ?? target.email}'s role to ${newRole}`,
    before: { role: target.role },
    after: { role: newRole },
  });

  revalidatePath("/settings/members");
  return ok(undefined);
}

// ─────────────────────────────── Remove member ────────────────────────────

export async function removeMemberAction(memberId: string): Promise<ActionResult> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "member:manage")) {
    return fail("You don't have permission to manage members.");
  }
  if (memberId === user.id) {
    return fail("You can't remove yourself. Ask another Owner to do this.");
  }

  const target = await prisma.user.findFirst({
    where: { id: memberId, orgId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!target) return fail("Member not found.");

  if (!canManageMember(user.role as Role, target.role as Role)) {
    return fail("You can only remove members with a role below your own.");
  }

  if (target.role === "OWNER") {
    const owners = await countOwners(orgId);
    if (owners <= 1) {
      return fail("You can't remove the only Owner of the workspace.");
    }
  }

  // Detach rather than delete the user record outright — preserves ticket
  // history (assignee/author references) while ending their access.
  await prisma.user.update({
    where: { id: memberId },
    data: { orgId: null },
  });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "member.removed",
    entity: "User",
    entityId: memberId,
    summary: `Removed ${target.name ?? target.email} from the workspace`,
    before: { role: target.role },
  });

  revalidatePath("/settings/members");
  return ok(undefined);
}
