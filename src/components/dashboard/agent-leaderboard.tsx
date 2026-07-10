import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Trophy } from "lucide-react";

interface AgentLeaderboardProps {
  data: Array<{ name: string; resolved: number }>;
  periodLabel?: string;
}

export function AgentLeaderboard({ data, periodLabel = "30d" }: AgentLeaderboardProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Agent Leaderboard ({periodLabel})</CardTitle>
        <Trophy className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-sm text-muted-foreground">
            No resolved tickets in this period.
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {data.map((agent, index) => (
              <div key={agent.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="size-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{agent.name}</p>
                    {index === 0 && (
                      <p className="text-xs text-muted-foreground">Top Performer</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tabular-nums">{agent.resolved}</span>
                  <span className="text-xs text-muted-foreground">resolved</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
