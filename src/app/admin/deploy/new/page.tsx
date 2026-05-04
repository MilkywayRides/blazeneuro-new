import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { githubConnection } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportRepoForm } from "@/components/import-repo-form";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const session = await requireAdmin();
  const githubConn = await db.select().from(githubConnection).where(eq(githubConnection.userId, session.user.id)).limit(1);

  if (githubConn.length === 0) {
    redirect("/admin/deploy");
  }

  const userData = {
    name: session.user.name || "Admin",
    email: session.user.email || "admin@blazeneuro.com",
    avatar: session.user.image || "/avatars/admin.jpg",
  };

  return (
    
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Import Repository</h1>
            <p className="text-sm md:text-base text-muted-foreground">Import a GitHub repository to deploy</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Repository</CardTitle>
              <CardDescription>Choose a repository from your GitHub account</CardDescription>
            </CardHeader>
            <CardContent>
              <ImportRepoForm githubConnection={githubConn[0]} userId={session.user.id} />
            </CardContent>
          </Card>
        </div>
      
  );
}
