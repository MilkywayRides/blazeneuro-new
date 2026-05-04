import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-check";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    color: "hsl(var(--chart-1))",
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
        <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 bg-gradient-to-br from-background via-background to-muted/30 min-h-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              Dashboard
            </h1>
            <p className="text-base text-muted-foreground flex items-center gap-2">
              Welcome back, <span className="font-semibold text-foreground">{session.user.name}</span>
              <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Name</CardTitle>
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold tracking-tight">{session.user.name}</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-50" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle>
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold tracking-tight truncate">{session.user.email}</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-50" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Account ID</CardTitle>
                <div className="p-2 rounded-full bg-purple-500/10">
                  <Shield className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-sm font-mono truncate tracking-wider">{session.user.id}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4 overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
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

            <Card className="lg:col-span-3 overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your BlazeNeuro account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="flex flex-col items-center justify-center gap-4 py-6">
                  {session.user.image ? (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                      <img src={session.user.image} alt="Profile" className="relative h-24 w-24 rounded-full border-2 border-background object-cover" />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="text-center space-y-1">
                    <p className="text-xl font-bold tracking-tight">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{session.user.email}</p>
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
