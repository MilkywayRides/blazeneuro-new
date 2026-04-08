import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { user, session, blog, oauthApp, oauthToken } from "@/lib/schema";
import { sql, eq, gte } from "drizzle-orm";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { Users, FileText, Shield, Activity } from "lucide-react";

export default async function AnalyticsPage() {
  const sessionData = await requireAdmin();

  // Get counts
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(user);
  const [blogCount] = await db.select({ count: sql<number>`count(*)` }).from(blog);
  const [publishedBlogCount] = await db.select({ count: sql<number>`count(*)` }).from(blog).where(eq(blog.published, true));
  const [oauthAppCount] = await db.select({ count: sql<number>`count(*)` }).from(oauthApp);
  const [activeSessionCount] = await db.select({ count: sql<number>`count(*)` }).from(session).where(gte(session.expiresAt, new Date()));

  // Get user growth data (last 30 days)
  const userGrowthResult = await db.execute(sql`
    SELECT DATE("createdAt") as date, COUNT(*) as count
    FROM "user"
    WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    GROUP BY DATE("createdAt")
    ORDER BY date
  `);

  // Get blog stats
  const blogStatsResult = await db.execute(sql`
    SELECT DATE("createdAt") as date, COUNT(*) as count
    FROM "blog"
    WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    GROUP BY DATE("createdAt")
    ORDER BY date
  `);

  // Get user roles distribution
  const userRolesResult = await db.execute(sql`
    SELECT role, COUNT(*) as count
    FROM "user"
    GROUP BY role
  `);

  // Get OAuth app usage
  const oauthUsageResult = await db.execute(sql`
    SELECT o.name, COUNT(t.id) as count
    FROM "oauthApp" o
    LEFT JOIN "oauthToken" t ON o.id = t."appId"
    GROUP BY o.id, o.name
    ORDER BY count DESC
    LIMIT 10
  `);

  const userData = {
    name: sessionData.user.name || "Admin",
    email: sessionData.user.email || "admin@blazeneuro.com",
    avatar: sessionData.user.image || "/avatars/admin.jpg",
  };

  const stats = {
    totalUsers: Number(userCount.count),
    totalBlogs: Number(blogCount.count),
    publishedBlogs: Number(publishedBlogCount.count),
    oauthApps: Number(oauthAppCount.count),
    activeSessions: Number(activeSessionCount.count),
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
      <AppSidebar variant="inset" userData={userData} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Overview of your platform metrics
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeSessions} active sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBlogs}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.publishedBlogs} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OAuth Apps</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.oauthApps}</div>
                <p className="text-xs text-muted-foreground">Active applications</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSessions}</div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>
          </div>

          <AnalyticsCharts
            userGrowth={(userGrowthResult as any).rows || []}
            blogStats={(blogStatsResult as any).rows || []}
            userRoles={(userRolesResult as any).rows || []}
            oauthUsage={(oauthUsageResult as any).rows || []}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
