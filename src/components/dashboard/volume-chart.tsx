"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VolumeChartProps {
  data: Array<{ date: string; created: number; resolved: number }>;
}

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Ticket Volume (30d)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} 
                dy={10} 
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "13px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "10px" }} />
              <Line
                name="Created"
                type="monotone"
                dataKey="created"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                name="Resolved"
                type="monotone"
                dataKey="resolved"
                stroke="#10b981" // emerald-500
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
