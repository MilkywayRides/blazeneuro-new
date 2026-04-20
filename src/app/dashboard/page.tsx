import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Page() {
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
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground">Welcome back, {session.user.name}</p>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>OAuth Applications</CardTitle>
                <CardDescription>Manage your OAuth apps</CardDescription>
              </div>
              <Link href="/dashboard/oauth/new">
                <Button><Plus className="h-4 w-4 mr-2" />New App</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {userApps.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No OAuth apps yet. Create one to get started.</p>
              ) : (
                <div className="space-y-2">
                  {userApps.map((app) => (
                    <Link key={app.id} href={`/dashboard/oauth/${app.id}`}>
                      <div className="p-4 border rounded-lg hover:bg-accent">
                        <h3 className="font-medium">{app.name}</h3>
                        <p className="text-sm text-muted-foreground">{app.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
