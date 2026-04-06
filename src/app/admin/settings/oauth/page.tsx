import { requireAuth } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthToken, oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AddOAuthAppDialog } from "@/components/add-oauth-app-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OAuthSettingsPage() {
  const session = await requireAuth();
  
  const authorizedApps = await db
    .select({
      app: oauthApp,
      token: oauthToken,
    })
    .from(oauthToken)
    .innerJoin(oauthApp, eq(oauthToken.appId, oauthApp.id))
    .where(eq(oauthToken.userId, session.user.id));

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">OAuth Settings</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage permissions for apps that access your BlazeNeuro account
              </p>
            </div>
            <AddOAuthAppDialog />
          </div>

          {authorizedApps.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 md:p-12 text-center">
              <h3 className="text-base md:text-lg font-semibold mb-2">No authorized apps</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                Add an app to get started
              </p>
              <AddOAuthAppDialog />
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application Name</TableHead>
                    <TableHead className="hidden md:table-cell">Client ID</TableHead>
                    <TableHead className="hidden lg:table-cell">Homepage URL</TableHead>
                    <TableHead className="hidden sm:table-cell">Authorized</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authorizedApps.map(({ app, token }) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{app.clientId}</code>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {app.homepageUrl}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {new Date(token.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/settings/oauth/${token.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
