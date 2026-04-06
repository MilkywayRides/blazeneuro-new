import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { project, deployment, githubConnection } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;

  try {
    const proj = await db.select().from(project).where(eq(project.id, params.id)).limit(1);
    
    if (proj.length === 0 || proj[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const currentProject = proj[0];
    
    const githubConn = await db.select().from(githubConnection)
      .where(eq(githubConnection.id, currentProject.githubConnectionId!))
      .limit(1);

    if (githubConn.length === 0) {
      return NextResponse.json({ error: "GitHub connection not found" }, { status: 404 });
    }

    // Get latest commit from GitHub
    const commitResponse = await fetch(
      `https://api.github.com/repos/${currentProject.repoFullName}/commits/${currentProject.branch}`,
      {
        headers: {
          Authorization: `Bearer ${githubConn[0].accessToken}`,
        },
      }
    );

    const commitData = await commitResponse.json();

    // Create deployment record
    const newDeployment = await db.insert(deployment).values({
      id: nanoid(),
      projectId: currentProject.id,
      status: "pending",
      commitSha: commitData.sha,
      commitMessage: commitData.commit.message,
      branch: currentProject.branch,
    }).returning();

    // Trigger GitHub Actions workflow
    const workflowResponse = await fetch(
      `https://api.github.com/repos/${currentProject.repoFullName}/actions/workflows/deploy.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubConn[0].accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: currentProject.branch,
          inputs: {
            deployment_id: newDeployment[0].id,
            subdomain: currentProject.subdomain,
          },
        }),
      }
    );

    if (!workflowResponse.ok) {
      await db.update(deployment)
        .set({ status: "failed", buildLogs: "Failed to trigger GitHub Actions" })
        .where(eq(deployment.id, newDeployment[0].id));
      
      return NextResponse.json({ error: "Failed to trigger deployment" }, { status: 500 });
    }

    return NextResponse.json(newDeployment[0]);
  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json({ error: "Deployment failed" }, { status: 500 });
  }
}
