import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deploy - Admin",
};

import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { project, githubConnection } from "@/lib/schema";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function DeployPage() {
  const session = await requireAdmin();
  const userProjects = await db.select().from(project).where(eq(project.userId, session.user.id));
  const githubConn = await db.select().from(githubConnection).where(eq(githubConnection.userId, session.user.id)).limit(1);

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
              <h1 className="text-2xl md:text-3xl font-bold">Deploy</h1>
              <p className="text-sm md:text-base text-muted-foreground">Deploy your Next.js applications</p>
            </div>
            {githubConn.length > 0 && (
              <Link href="/admin/deploy/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </Link>
            )}
          </div>

          {githubConn.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Connect GitHub Account</CardTitle>
                <CardDescription>
                  Connect your GitHub account to import and deploy repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/api/auth/github/connect">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect GitHub
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userProjects.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No projects yet</CardTitle>
                    <CardDescription>
                      Create your first project to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/admin/deploy/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userProjects.map((proj) => (
                    <Card key={proj.id}>
                      <CardHeader>
                        <CardTitle>{proj.name}</CardTitle>
                        <CardDescription>{proj.repoFullName}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link href={`/admin/deploy/${proj.id}`}>
                          <Button variant="outline" className="w-full">
                            View Project
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
