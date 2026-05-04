import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthAuthorization, oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Linked Accounts - Dashboard",
};

export default async function LinkedAccountsPage() {
  const session = await requireAuth();

  const authorizations = await db
    .select({
      appId: oauthApp.id,
      appName: oauthApp.name,
      homepageUrl: oauthApp.homepageUrl,
      description: oauthApp.description,
      authorizedAt: oauthAuthorization.createdAt,
    })
    .from(oauthAuthorization)
    .innerJoin(oauthApp, eq(oauthAuthorization.appId, oauthApp.id))
    .where(eq(oauthAuthorization.userId, session.user.id));

  // Deduplicate by app id to show unique apps
  const uniqueAppsMap = new Map();
  for (const auth of authorizations) {
    if (!uniqueAppsMap.has(auth.appId)) {
      uniqueAppsMap.set(auth.appId, auth);
    } else {
       if (auth.authorizedAt > uniqueAppsMap.get(auth.appId).authorizedAt) {
         uniqueAppsMap.set(auth.appId, auth);
       }
    }
  }
  const linkedApps = Array.from(uniqueAppsMap.values());

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
        <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 bg-gradient-to-br from-background via-background to-muted/30 min-h-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              Linked Accounts
            </h1>
            <p className="text-base text-muted-foreground">
              Manage the third-party applications that have access to your BlazeNeuro account.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {linkedApps.length === 0 ? (
              <div className="col-span-full py-12 text-center border rounded-xl bg-background/50 backdrop-blur-sm border-dashed">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No linked applications</h3>
                <p className="text-muted-foreground mt-1">You haven't authorized any third-party apps yet.</p>
              </div>
            ) : (
              linkedApps.map((app) => (
                <Card key={app.appId} className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{app.appName}</CardTitle>
                        <CardDescription className="line-clamp-2">{app.description || "No description provided"}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Authorized on {new Date(app.authorizedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Link href={app.homepageUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" className="w-full h-8 text-xs" size="sm">
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Visit App
                        </Button>
                      </Link>
                      <Button variant="destructive" className="h-8 text-xs" size="sm">
                        Revoke Access
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
