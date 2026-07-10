import { Inbox, CheckCircle2, Clock, Activity } from "lucide-react";

interface KPICardsProps {
  data: {
    openCount: number;
    resolvedCount: number;
    resolutionRate: number;
    avgFirstResponseHours: number;
  };
  periodLabel?: string;
}

export function KPICards({ data, periodLabel = "30d" }: KPICardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <Inbox className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Total Open</p>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold tabular-nums">{data.openCount}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Resolved ({periodLabel})</p>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold tabular-nums">{data.resolvedCount}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Avg First Response</p>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold tabular-nums">
            {data.avgFirstResponseHours}
          </p>
          <span className="text-sm font-medium text-muted-foreground">hrs</span>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold tabular-nums">{data.resolutionRate}%</p>
        </div>
      </div>
    </div>
  );
}
