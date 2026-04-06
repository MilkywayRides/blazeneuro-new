import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deployment } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");
  
  if (!apiKey || apiKey !== process.env.BLAZENEURO_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const body = await req.json();
  const { status, githubRunId, buildLogs } = body;

  try {
    const updated = await db.update(deployment)
      .set({
        status,
        githubRunId,
        buildLogs,
        completedAt: status === "success" || status === "failed" ? new Date() : undefined,
        deployUrl: status === "success" ? `https://${body.subdomain}.blazeneuro.com` : undefined,
      })
      .where(eq(deployment.id, params.id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Failed to update deployment:", error);
    return NextResponse.json({ error: "Failed to update deployment" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");
  
  if (!apiKey || apiKey !== process.env.BLAZENEURO_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;

  // Handle file upload
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const subdomain = formData.get("subdomain") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    // Here you would:
    // 1. Save the deployment package to your storage (S3, etc.)
    // 2. Extract and deploy to your hosting infrastructure
    // 3. Update DNS/routing for the subdomain
    
    // For now, just update the deployment status
    await db.update(deployment)
      .set({
        status: "building",
        deployUrl: `https://${subdomain}.blazeneuro.com`,
      })
      .where(eq(deployment.id, params.id));

    return NextResponse.json({ success: true, url: `https://${subdomain}.blazeneuro.com` });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
