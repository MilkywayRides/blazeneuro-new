import { requireAuth } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthToken, oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OAuthPermissionCard } from "@/components/oauth-permission-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function OAuthAppDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;

  const result = await db
    .select({
      app: oauthApp,
      token: oauthToken,
    })
    .from(oauthToken)
    .innerJoin(oauthApp, eq(oauthToken.appId, oauthApp.id))
    .where(eq(oauthToken.id, id))
    .where(eq(oauthToken.userId, session.user.id))
    .limit(1);

  if (!result[0]) {
    notFound();
  }

  const { app, token } = result[0];

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
      <AppSidebar variant="inset" userData={userData} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div>
            <Link href="/admin/settings/oauth">
              <Button variant="ghost" size="sm" className="mb-4">
                <ChevronLeft className="h-4 w-4" />
                Back to OAuth Settings
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">{app.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage permissions for this application
            </p>
          </div>

          <OAuthPermissionCard app={app} token={token} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
