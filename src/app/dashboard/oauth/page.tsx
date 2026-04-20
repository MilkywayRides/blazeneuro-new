import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewOAuthAppDialog } from "@/components/new-oauth-app-dialog";

export const metadata: Metadata = {
  title: "OAuth Apps - Dashboard",
};

export default async function OAuthPage() {
  const session = await requireAuth();
  const userApps = await db.select().from(oauthApp).where(eq(oauthApp.userId, session.user.id));

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" isAdmin={false} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">OAuth Applications</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage your OAuth apps</p>
            </div>
            <NewOAuthAppDialog />
          </div>

          {userApps.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">No OAuth apps yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first OAuth application to get started</p>
                  <NewOAuthAppDialog />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userApps.map((app) => (
                <Link key={app.id} href={`/dashboard/oauth/${app.id}`}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardHeader>
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{app.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Client ID: {app.clientId.slice(0, 16)}...</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
