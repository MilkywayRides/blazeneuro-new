"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

type AnalyticsChartsProps = {
  userGrowth: any[];
  blogStats: any[];
  userRoles: any[];
  oauthUsage: any[];
};

const DottedBackgroundPattern = () => (
  <pattern id="pattern-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
    <circle className="dark:text-muted/40 text-muted" cx="2" cy="2" r="1" fill="currentColor" />
  </pattern>
);

export function AnalyticsCharts({ userGrowth, blogStats, userRoles, oauthUsage }: AnalyticsChartsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const userGrowthData = (userGrowth || []).map((item) => ({
    date: formatDate(item.date),
    users: Number(item.count),
  }));

  const blogStatsData = (blogStats || []).map((item) => ({
    date: formatDate(item.date),
    blogs: Number(item.count),
  }));

  const userRolesData = (userRoles || []).map((item) => ({
    name: item.role,
    value: Number(item.count),
  }));

  const oauthUsageData = (oauthUsage || []).map((item) => ({
    name: item.name,
    authorizations: Number(item.count),
  }));

  const userChartConfig = {
    users: { label: "Users", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  const blogChartConfig = {
    blogs: { label: "Blogs", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>
            User Growth
            <Badge variant="outline" className="text-green-500 bg-green-500/10 border-none ml-2">
              <TrendingUp className="h-4 w-4" />
              <span>+12.5%</span>
            </Badge>
          </CardTitle>
          <CardDescription>New user registrations over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={userChartConfig} className="h-[250px] w-full">
            <LineChart accessibilityLayer data={userGrowthData}>
              <rect x="0" y="0" width="100%" height="85%" fill="url(#pattern-dots)" />
              <defs><DottedBackgroundPattern /></defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>
            Blog Posts Created
            <Badge variant="outline" className="text-green-500 bg-green-500/10 border-none ml-2">
              <TrendingUp className="h-4 w-4" />
              <span>+8.3%</span>
            </Badge>
          </CardTitle>
          <CardDescription>Blog posts published over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={blogChartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={blogStatsData}>
              <rect x="0" y="0" width="100%" height="85%" fill="url(#pattern-dots)" />
              <defs><DottedBackgroundPattern /></defs>
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="blogs" fill="var(--color-blogs)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Roles Distribution</CardTitle>
          <CardDescription>Breakdown of users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: { label: "Users", color: "hsl(var(--chart-1))" } }} className="h-[250px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={userRolesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--chart-1))"
                dataKey="value"
              >
                {userRolesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OAuth App Usage</CardTitle>
          <CardDescription>Top OAuth apps by authorizations</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ authorizations: { label: "Authorizations", color: "hsl(var(--chart-3))" } }} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={oauthUsageData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="authorizations" fill="hsl(var(--chart-3))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
