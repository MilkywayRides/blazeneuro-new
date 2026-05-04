import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-check";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Activity, Zap } from "lucide-react";
import { EvilAreaChart } from "@/components/evilcharts/charts/area-chart";
import { AnalyticsTracker } from "@/components/analytics-tracker";

export const metadata: Metadata = {
  title: "Dashboard",
};

const accountActiveData = [
  { month: "Jan", activeFrequency: 120 },
  { month: "Feb", activeFrequency: 230 },
  { month: "Mar", activeFrequency: 180 },
  { month: "Apr", activeFrequency: 390 },
  { month: "May", activeFrequency: 450 },
  { month: "Jun", activeFrequency: 580 },
  { month: "Jul", activeFrequency: 850 },
];

const chartConfig = {
  activeFrequency: {
    label: "Active Sessions",
    color: "var(--color-chart-1)",
  },
};

export default async function Page() {
  const session = await requireAuth();

  const userData = {
    name: session.user.name || "User",
    email: session.user.email || "",
    avatar: session.user.image || "/avatars/default.jpg",
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AnalyticsTracker 
        userId={session.user.id} 
        name={session.user.name} 
        email={session.user.email} 
      />
      <AppSidebar variant="inset" isAdmin={false} userData={userData} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 min-h-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Dashboard
            </h1>
            <p className="text-base text-muted-foreground flex items-center gap-2">
              Welcome back, <span className="font-semibold text-foreground">{session.user.name}</span>
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Name</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{session.user.name}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight truncate">{session.user.email}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account ID</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono truncate tracking-wider">{session.user.id}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <CardTitle>Account Active Frequency</CardTitle>
                </div>
                <CardDescription>Your session activity over the last 7 months</CardDescription>
              </CardHeader>
              <CardContent className="pl-0 pb-4">
                <div className="h-[300px] w-full mt-4 pr-4">
                  <EvilAreaChart
                    data={accountActiveData}
                    chartConfig={chartConfig}
                    xDataKey="month"
                    areaVariant="gradient"
                    strokeVariant="dashed"
                    curveType="monotone"
                    className="w-full h-full"
                    isClickable={true}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your BlazeNeuro account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4 py-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                  </Avatar>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-bold tracking-tight">{session.user.name}</p>
                    <Badge variant="secondary">{session.user.email}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
