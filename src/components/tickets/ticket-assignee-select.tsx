"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateTicketAction } from "@/app/(app)/tickets/actions";
import { toast } from "sonner";

interface MemberOption {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface TicketAssigneeSelectProps {
  ticketId: string;
  currentAssigneeId: string | null;
  members: MemberOption[];
}

export function TicketAssigneeSelect({
  ticketId,
  currentAssigneeId,
  members,
}: TicketAssigneeSelectProps) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const assigneeId = value === "__unassigned__" ? null : value;
    startTransition(async () => {
      const result = await updateTicketAction(ticketId, { assigneeId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const name = members.find((m) => m.id === assigneeId)?.name ?? "Unassigned";
      toast.success(`Assigned to ${assigneeId ? name : "nobody"}`);
    });
  }

  return (
    <Select
      defaultValue={currentAssigneeId ?? "__unassigned__"}
      onValueChange={onChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__unassigned__">Unassigned</SelectItem>
        {members.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            <span className="flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarImage src={m.image ?? undefined} />
                <AvatarFallback className="text-[9px]">
                  {(m.name ?? m.email)[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {m.name ?? m.email}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
