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

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { orgId } = await getTenant();

  // Fetch all analytics data in parallel
  const [kpis, volumeSeries, statusData, priorityData, leaderboardData] =
    await Promise.all([
      getDashboardKPIs(orgId),
      getTicketVolumeSeries(orgId),
      getTicketsByStatus(orgId),
      getTicketsByPriority(orgId),
      getAgentLeaderboard(orgId),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your support workspace over the last 30 days.
        </p>
      </div>

      <KPICards data={kpis} />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {/* Top row: Volume chart takes half on big screens, status donut takes a quarter */}
        <VolumeChart data={volumeSeries} />
        <StatusDistribution data={statusData} />
        <PriorityChart data={priorityData} />

        {/* Next row: Leaderboard */}
        <AgentLeaderboard data={leaderboardData} />
      </div>
    </div>
  );
}
