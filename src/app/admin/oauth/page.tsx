import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OAuthAppDialog } from "@/components/oauth-app-dialog";
import { OAuthAppActions } from "@/components/oauth-app-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { RelativeTime } from "@/components/relative-time";

export default async function OAuthAppsPage() {
  const session = await requireAdmin();
  const allApps = await db.select().from(oauthApp).orderBy(oauthApp.createdAt);
  
  const activeApps = allApps.filter(app => !app.archived);
  const archivedApps = allApps.filter(app => app.archived);

  const userData = {
    name: session.user.name || "Admin",
    email: session.user.email || "admin@blazeneuro.com",
    avatar: session.user.image || "/avatars/admin.jpg",
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
              <h1 className="text-2xl md:text-3xl font-bold">OAuth Applications</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage OAuth apps that can access BlazeNeuro</p>
            </div>
            <OAuthAppDialog />
          </div>

          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active ({activeApps.length})</TabsTrigger>
              <TabsTrigger value="archived">Archived ({archivedApps.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              {activeApps.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 md:p-12 text-center">
                  <h3 className="text-base md:text-lg font-semibold mb-2">No OAuth apps yet</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">Create your first OAuth application to get started</p>
                  <OAuthAppDialog />
                </div>
              ) : (
                <div className="rounded-lg border bg-card overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application Name</TableHead>
                        <TableHead className="hidden md:table-cell">Client ID</TableHead>
                        <TableHead className="hidden lg:table-cell">Homepage URL</TableHead>
                        <TableHead className="hidden lg:table-cell">Callback URL</TableHead>
                        <TableHead className="hidden sm:table-cell">Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeApps.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{app.clientId}</code>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{app.homepageUrl}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{app.callbackUrl}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <RelativeTime date={app.createdAt} />
                          </TableCell>
                          <TableCell>
                            <OAuthAppActions appId={app.id} archived={false} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived" className="mt-4">
              {archivedApps.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 md:p-12 text-center">
                  <h3 className="text-base md:text-lg font-semibold mb-2">No archived apps</h3>
                  <p className="text-sm md:text-base text-muted-foreground">Archived applications will appear here</p>
                </div>
              ) : (
                <div className="rounded-lg border bg-card overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application Name</TableHead>
                        <TableHead className="hidden md:table-cell">Client ID</TableHead>
                        <TableHead className="hidden sm:table-cell">Archived</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedApps.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{app.clientId}</code>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <RelativeTime date={app.updatedAt} />
                          </TableCell>
                          <TableCell>
                            <OAuthAppActions appId={app.id} archived={true} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
