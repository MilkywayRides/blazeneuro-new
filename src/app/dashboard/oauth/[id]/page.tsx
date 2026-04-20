import { requireAuth } from "@/lib/auth-check";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { deleteUserOAuthApp } from "../actions";

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

  async function handleDelete() {
    "use server";
    await deleteUserOAuthApp(id);
  }

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
            <form action={handleDelete}>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </Button>
            </form>
          </div>

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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
