"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getTenant } from "@/lib/dal/context";
import { writeAuditLog } from "@/lib/dal/audit";
import { can } from "@/lib/auth/permissions";
import {
  createTicketSchema,
  updateTicketSchema,
  createCommentSchema,
} from "@/lib/validations/ticket";
import { fieldErrorsOf } from "@/lib/validations/errors";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { Role } from "@/lib/constants/enums";

// ──────────────────────────── Create ticket ─────────────────────────────────

export async function createTicketAction(
  raw: unknown,
): Promise<ActionResult<{ id: string; number: number }>> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "ticket:create")) {
    return fail("You don't have permission to create tickets.");
  }

  const parsed = createTicketSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }

  const { subject, body, contactId, priority, assigneeId } = parsed.data;

  // Atomic ticket-counter increment + ticket create in one transaction.
  const ticket = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.update({
      where: { id: orgId },
      data: { ticketCounter: { increment: 1 } },
      select: { ticketCounter: true },
    });

    const created = await tx.ticket.create({
      data: {
        orgId,
        number: org.ticketCounter,
        subject,
        body,
        priority,
        contactId,
        assigneeId: assigneeId || null,
      },
      select: { id: true, number: true },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: created.id,
        type: "created",
        actorId: user.id,
        data: JSON.stringify({ status: "OPEN", priority }),
      },
    });

    return created;
  });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "ticket.created",
    entity: "Ticket",
    entityId: ticket.id,
    summary: `Created ticket #${ticket.number}: ${subject}`,
    after: { subject, priority, contactId, assigneeId: assigneeId ?? null },
  });

  revalidatePath("/tickets");
  return ok({ id: ticket.id, number: ticket.number });
}

// ──────────────────────────── Update ticket ─────────────────────────────────

export async function updateTicketAction(
  ticketId: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "ticket:update")) {
    return fail("You don't have permission to update tickets.");
  }

  const parsed = updateTicketSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }

  const existing = await prisma.ticket.findFirst({
    where: { id: ticketId, orgId, deletedAt: null },
    select: {
      id: true,
      subject: true,
      body: true,
      status: true,
      priority: true,
      assigneeId: true,
      contactId: true,
    },
  });
  if (!existing) return fail("Ticket not found.");

  const data = parsed.data;
  const events: Array<{ type: string; data: string }> = [];

  if (data.status && data.status !== existing.status) {
    events.push({
      type: "status_changed",
      data: JSON.stringify({ from: existing.status, to: data.status }),
    });
  }
  if (data.priority && data.priority !== existing.priority) {
    events.push({
      type: "priority_changed",
      data: JSON.stringify({ from: existing.priority, to: data.priority }),
    });
  }
  if (data.assigneeId !== undefined && data.assigneeId !== existing.assigneeId) {
    events.push({
      type: data.assigneeId ? "assigned" : "unassigned",
      data: JSON.stringify({ from: existing.assigneeId, to: data.assigneeId }),
    });
  }

  const resolvedAt =
    data.status === "RESOLVED" || data.status === "CLOSED"
      ? new Date()
      : data.status
        ? null
        : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        ...data,
        assigneeId: data.assigneeId === undefined ? undefined : (data.assigneeId ?? null),
        ...(resolvedAt !== undefined ? { resolvedAt } : {}),
      },
    });

    for (const event of events) {
      await tx.ticketEvent.create({
        data: { ticketId, type: event.type, data: event.data, actorId: user.id },
      });
    }
  });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: events.some((e) => e.type === "status_changed")
      ? "ticket.status_changed"
      : events.some((e) => e.type === "assigned" || e.type === "unassigned")
        ? "ticket.assigned"
        : "ticket.updated",
    entity: "Ticket",
    entityId: ticketId,
    summary: `Updated ticket #${existing.id}`,
    before: {
      status: existing.status,
      priority: existing.priority,
      assigneeId: existing.assigneeId,
    },
    after: data as Record<string, unknown>,
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
  return ok({ id: ticketId });
}

// ──────────────────────────── Delete ticket (soft) ──────────────────────────

export async function deleteTicketAction(
  ticketId: string,
): Promise<ActionResult> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "ticket:delete")) {
    return fail("You don't have permission to delete tickets.");
  }

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, orgId, deletedAt: null },
    select: { id: true, number: true, subject: true },
  });
  if (!ticket) return fail("Ticket not found.");

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "ticket.deleted",
    entity: "Ticket",
    entityId: ticketId,
    summary: `Deleted ticket #${ticket.number}: ${ticket.subject}`,
  });

  revalidatePath("/tickets");
  return ok(undefined);
}

// ──────────────────────────── Add comment ───────────────────────────────────

export async function addCommentAction(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "comment:create")) {
    return fail("You don't have permission to comment.");
  }

  const parsed = createCommentSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Please fix the errors below.", fieldErrorsOf(parsed.error));
  }

  const { ticketId, body, isInternal } = parsed.data;

  // Verify ticket belongs to this org.
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, orgId, deletedAt: null },
    select: { id: true, number: true, firstResponseAt: true },
  });
  if (!ticket) return fail("Ticket not found.");

  const comment = await prisma.comment.create({
    data: { ticketId, authorId: user.id, body, isInternal },
  });

  // Set firstResponseAt on the first non-internal reply (agent's first response).
  if (!ticket.firstResponseAt && !isInternal) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { firstResponseAt: new Date() },
    });
  }

  await writeAuditLog({
    orgId,
    actorId: user.id,
    action: "comment.created",
    entity: "Comment",
    entityId: comment.id,
    summary: `Added ${isInternal ? "internal note" : "reply"} on ticket #${ticket.number}`,
  });

  revalidatePath(`/tickets/${ticketId}`);
  return ok({ id: comment.id });
}
