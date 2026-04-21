"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsChartProps {
  data: { date: string; count: number }[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  );
}
