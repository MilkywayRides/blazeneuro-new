import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { project, deployment } from "@/lib/schema";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeployButton } from "@/components/deploy-button";
import { RelativeTime } from "@/components/relative-time";
import { ExternalLink, GitBranch } from "lucide-react";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ProjectPage(props: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const params = await props.params;
  
  if (!params?.id) {
    notFound();
  }
  
  const proj = await db.select().from(project).where(eq(project.id, params.id)).limit(1);
  
  if (proj.length === 0 || proj[0].userId !== session.user.id) {
    notFound();
  }

  const deployments = await db.select().from(deployment).where(eq(deployment.projectId, params.id)).orderBy(desc(deployment.createdAt));

  const userData = {
    name: session.user.name || "Admin",
    email: session.user.email || "admin@blazeneuro.com",
    avatar: session.user.image || "/avatars/admin.jpg",
  };

  const currentProject = proj[0];

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
              <h1 className="text-2xl md:text-3xl font-bold">{currentProject.name}</h1>
              <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                {currentProject.repoFullName} · {currentProject.branch}
              </p>
            </div>
            <DeployButton projectId={currentProject.id} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Domain</p>
                  <p className="font-medium">{currentProject.subdomain}.blazeneuro.com</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Repository</p>
                  <Link href={currentProject.repoUrl || "#"} target="_blank" className="text-sm text-primary hover:underline inline-flex items-center">
                    {currentProject.repoFullName}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Framework</p>
                  <p className="font-medium capitalize">{currentProject.framework}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Build Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Build Command</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{currentProject.buildCommand}</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Output Directory</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{currentProject.outputDirectory}</code>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Deployments</CardTitle>
              <CardDescription>Recent deployment history</CardDescription>
            </CardHeader>
            <CardContent>
              {deployments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deployments yet</p>
              ) : (
                <div className="space-y-4">
                  {deployments.map((dep) => (
                    <div key={dep.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={dep.status === "success" ? "default" : dep.status === "failed" ? "destructive" : "secondary"}>
                              {dep.status}
                            </Badge>
                            <span className="text-sm font-medium">{dep.commitMessage || "No message"}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <RelativeTime date={dep.createdAt} />
                          </p>
                        </div>
                        {dep.deployUrl && (
                          <Link href={dep.deployUrl} target="_blank">
                            <Button variant="outline" size="sm">
                              Visit
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                      {dep.buildLogs && (
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1">Build Logs:</p>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40 overflow-y-auto">
                            {dep.buildLogs}
                          </pre>
                        </div>
                      )}
                      {dep.githubRunId && (
                        <Link href={`https://github.com/${currentProject.repoFullName}/actions/runs/${dep.githubRunId}`} target="_blank">
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            View on GitHub Actions
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
