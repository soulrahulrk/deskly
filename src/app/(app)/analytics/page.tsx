import type { Metadata } from "next";
import { getTenant } from "@/lib/dal/context";
import {
  getDashboardKPIs,
  getTicketVolumeSeries,
  getTicketsByStatus,
  getTicketsByPriority,
  getAgentLeaderboard,
} from "@/lib/dal/analytics";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { StatusDistribution } from "@/components/dashboard/status-distribution";
import { PriorityChart } from "@/components/dashboard/priority-chart";
import { AgentLeaderboard } from "@/components/dashboard/agent-leaderboard";
import { RangeSelector } from "./range-selector";

export const metadata: Metadata = { title: "Analytics" };

const RANGES = { "7": "7d", "30": "30d", "90": "90d" } as const;
const DEFAULT_RANGE = 30;

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AnalyticsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { orgId } = await getTenant();
  const searchParams = await props.searchParams;

  const rangeParam = typeof searchParams.range === "string" ? searchParams.range : undefined;
  const windowDays =
    rangeParam && rangeParam in RANGES ? Number(rangeParam) : DEFAULT_RANGE;
  const periodLabel = RANGES[String(windowDays) as keyof typeof RANGES] ?? "30d";

  const [kpis, volumeSeries, statusData, priorityData, leaderboardData] = await Promise.all([
    getDashboardKPIs(orgId, windowDays),
    getTicketVolumeSeries(orgId, windowDays),
    getTicketsByStatus(orgId),
    getTicketsByPriority(orgId),
    getAgentLeaderboard(orgId, windowDays, 20),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            A deeper look at support performance — pick a range to drill in.
          </p>
        </div>
        <RangeSelector current={windowDays} />
      </div>

      <KPICards data={kpis} periodLabel={periodLabel} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <VolumeChart data={volumeSeries} periodLabel={periodLabel} />
        <StatusDistribution data={statusData} />
        <PriorityChart data={priorityData} />
        <AgentLeaderboard data={leaderboardData} periodLabel={periodLabel} />
      </div>
    </div>
  );
}
