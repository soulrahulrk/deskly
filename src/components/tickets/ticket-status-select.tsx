"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TICKET_STATUSES, type TicketStatus } from "@/lib/constants/enums";
import { STATUS_META } from "@/lib/constants/display";
import { updateTicketAction } from "@/app/(app)/tickets/actions";
import { toast } from "sonner";

interface TicketStatusSelectProps {
  ticketId: string;
  currentStatus: TicketStatus;
}

export function TicketStatusSelect({
  ticketId,
  currentStatus,
}: TicketStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    startTransition(async () => {
      const result = await updateTicketAction(ticketId, {
        status: value as TicketStatus,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Status changed to ${STATUS_META[value as TicketStatus].label}`);
    });
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TICKET_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <span className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: STATUS_META[s].color }}
              />
              {STATUS_META[s].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
