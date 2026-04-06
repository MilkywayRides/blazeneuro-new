import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { project } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, repoFullName, repoUrl, branch, subdomain, githubConnectionId } = body;

  try {
    const newProject = await db.insert(project).values({
      id: nanoid(),
      name,
      userId: session.user.id,
      githubConnectionId,
      repoFullName,
      repoUrl,
      branch,
      subdomain,
    }).returning();

    return NextResponse.json(newProject[0]);
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
