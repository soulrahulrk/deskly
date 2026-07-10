"use client";

import { useOptimistic, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TICKET_PRIORITIES, type TicketPriority } from "@/lib/constants/enums";
import { PRIORITY_META } from "@/lib/constants/display";
import { updateTicketAction } from "@/app/(app)/tickets/actions";
import { toast } from "sonner";

interface TicketPrioritySelectProps {
  ticketId: string;
  currentPriority: TicketPriority;
}

/** Optimistic — see TicketStatusSelect for why. */
export function TicketPrioritySelect({
  ticketId,
  currentPriority,
}: TicketPrioritySelectProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticPriority, setOptimisticPriority] = useOptimistic(currentPriority);

  function onChange(value: string) {
    const priority = value as TicketPriority;
    startTransition(async () => {
      setOptimisticPriority(priority);
      const result = await updateTicketAction(ticketId, { priority });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Priority changed to ${PRIORITY_META[priority].label}`);
    });
  }

  return (
    <Select value={optimisticPriority} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TICKET_PRIORITIES.map((p) => (
          <SelectItem key={p} value={p}>
            <span className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: PRIORITY_META[p].color }}
              />
              {PRIORITY_META[p].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
