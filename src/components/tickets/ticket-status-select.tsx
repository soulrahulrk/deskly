"use client";

import { useOptimistic, useTransition } from "react";
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

/**
 * Optimistic: the select shows the new status immediately on change, before
 * the server confirms it. `useOptimistic` automatically reverts to
 * `currentStatus` once the transition settles — on success that's already
 * the new value (revalidatePath refreshed the prop); on failure it's still
 * the old one, so the UI snaps back and the toast explains why.
 */
export function TicketStatusSelect({
  ticketId,
  currentStatus,
}: TicketStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(currentStatus);

  function onChange(value: string) {
    const status = value as TicketStatus;
    startTransition(async () => {
      setOptimisticStatus(status);
      const result = await updateTicketAction(ticketId, { status });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Status changed to ${STATUS_META[status].label}`);
    });
  }

  return (
    <Select value={optimisticStatus} onValueChange={onChange} disabled={isPending}>
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
