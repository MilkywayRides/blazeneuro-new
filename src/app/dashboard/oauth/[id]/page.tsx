import { requireAuth } from "@/lib/auth-check";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { oauthApp, oauthToken } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Copy, Trash2, BarChart3 } from "lucide-react";
import { notFound } from "next/navigation";
import { DeleteButton } from "./delete-button";
import { AnalyticsChart } from "./analytics-chart";

export default async function OAuthAppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  const app = await db.select().from(oauthApp).where(
    and(eq(oauthApp.id, id), eq(oauthApp.userId, session.user.id))
  ).limit(1);

  if (!app || app.length === 0) {
    notFound();
  }

  const appData = app[0];

  // Get analytics data
  const tokens = await db.select({
    date: sql<string>`DATE(${oauthToken.createdAt})`,
    count: sql<number>`COUNT(*)::int`
  })
  .from(oauthToken)
  .where(eq(oauthToken.appId, id))
  .groupBy(sql`DATE(${oauthToken.createdAt})`)
  .orderBy(sql`DATE(${oauthToken.createdAt})`);

  const totalLogins = await db.select({ count: sql<number>`COUNT(*)::int` })
    .from(oauthToken)
    .where(eq(oauthToken.appId, id));

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
      <AppSidebar variant="inset" isAdmin={false} userData={userData} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/oauth">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{appData.name}</h1>
                <p className="text-muted-foreground">{appData.description}</p>
              </div>
            </div>
            <DeleteButton appId={id} />
          </div>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                  <CardDescription>OAuth credentials and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Client ID</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-muted rounded text-sm">{appData.clientId}</code>
                      <Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Client Secret</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-muted rounded text-sm">{appData.clientSecret}</code>
                      <Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Homepage URL</label>
                    <p className="mt-1 text-sm">{appData.homepageUrl}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Callback URL</label>
                    <p className="mt-1 text-sm">{appData.callbackUrl}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Logins</CardTitle>
                    <CardDescription>All-time OAuth authentications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalLogins[0]?.count || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Days</CardTitle>
                    <CardDescription>Days with login activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{tokens.length}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Login Frequency</CardTitle>
                  <CardDescription>Daily OAuth authentication activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart data={tokens} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
