"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changeMemberRoleAction, removeMemberAction } from "./actions";
import { ROLES, type Role } from "@/lib/constants/enums";
import { outranks } from "@/lib/auth/permissions";
import { ROLE_META } from "@/lib/constants/display";
import type { MemberSummary } from "@/lib/dal/members";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";

/** Only an Owner may grant Owner or Admin — mirrors the server-side rule for UX. */
function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  if (targetRole === "OWNER" || targetRole === "ADMIN") return actorRole === "OWNER";
  return true;
}

/** Mirrors the server's canManageMember: Owners manage anyone but themselves. */
function canManageMember(actorRole: Role, targetRole: Role): boolean {
  return actorRole === "OWNER" || outranks(actorRole, targetRole);
}

export function MembersTable({
  members,
  currentUserId,
  actorRole,
}: {
  members: MemberSummary[];
  currentUserId: string;
  actorRole: Role;
}) {
  const ownerCount = members.filter((m) => m.role === "OWNER").length;
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(memberId: string, role: Role) {
    setPendingId(memberId);
    startTransition(async () => {
      const result = await changeMemberRoleAction(memberId, { role });
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Role updated");
      }
      setPendingId(null);
    });
  }

  function handleRemove(memberId: string) {
    setPendingId(memberId);
    startTransition(async () => {
      const result = await removeMemberAction(memberId);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Member removed");
      }
      setPendingId(null);
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="w-16 text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const isSelf = member.id === currentUserId;
          const isSoleOwner = member.role === "OWNER" && ownerCount <= 1;
          const rowPending = isPending && pendingId === member.id;
          const canManageThisMember = canManageMember(actorRole, member.role as Role);

          return (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={member.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {(member.name ?? member.email)[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">
                      {member.name ?? member.email}
                      {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={member.role}
                  disabled={rowPending || isSelf || isSoleOwner || !canManageThisMember}
                  onValueChange={(value) => handleRoleChange(member.id, value as Role)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        disabled={!canAssignRole(actorRole, role)}
                      >
                        {ROLE_META[role].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={rowPending || isSelf || isSoleOwner || !canManageThisMember}
                      aria-label={`Remove ${member.name ?? member.email}`}
                    >
                      {rowPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {member.name ?? member.email}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        They&apos;ll lose access to this workspace immediately. Their past comments
                        and ticket history stay intact.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemove(member.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
