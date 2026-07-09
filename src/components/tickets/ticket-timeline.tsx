import {
  CircleDot,
  ArrowRightLeft,
  UserPlus,
  UserMinus,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { STATUS_META, PRIORITY_META } from "@/lib/constants/display";
import type { TicketStatus, TicketPriority } from "@/lib/constants/enums";

interface TicketEvent {
  id: string;
  type: string;
  data: string | null;
  createdAt: Date;
}

interface TicketTimelineProps {
  events: TicketEvent[];
}

const EVENT_ICONS: Record<string, typeof CircleDot> = {
  created: CircleDot,
  status_changed: ArrowRightLeft,
  priority_changed: AlertTriangle,
  assigned: UserPlus,
  unassigned: UserMinus,
  reopened: RotateCcw,
};

function parseEventData(data: string | null): Record<string, string> {
  if (!data) return {};
  try {
    return JSON.parse(data) as Record<string, string>;
  } catch {
    return {};
  }
}

function eventDescription(type: string, data: Record<string, string>): string {
  switch (type) {
    case "created":
      return "Ticket created";
    case "status_changed": {
      const from = data["from"] as TicketStatus | undefined;
      const to = data["to"] as TicketStatus | undefined;
      return `Status changed from ${from ? STATUS_META[from].label : "?"} to ${to ? STATUS_META[to].label : "?"}`;
    }
    case "priority_changed": {
      const from = data["from"] as TicketPriority | undefined;
      const to = data["to"] as TicketPriority | undefined;
      return `Priority changed from ${from ? PRIORITY_META[from].label : "?"} to ${to ? PRIORITY_META[to].label : "?"}`;
    }
    case "assigned":
      return "Ticket assigned";
    case "unassigned":
      return "Assignee removed";
    case "reopened":
      return "Ticket reopened";
    default:
      return type;
  }
}

export function TicketTimeline({ events }: TicketTimelineProps) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
      <div className="relative space-y-0">
        {events.map((event, i) => {
          const Icon = EVENT_ICONS[event.type] ?? CircleDot;
          const data = parseEventData(event.data);
          const isLast = i === events.length - 1;

          return (
            <div key={event.id} className="relative flex gap-3 pb-4">
              {!isLast && (
                <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
              )}
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-background">
                <Icon className="size-3 text-muted-foreground" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm">{eventDescription(event.type, data)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(event.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
