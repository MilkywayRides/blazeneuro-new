import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const apps = await db.select().from(oauthApp).where(eq(oauthApp.userId, userId));
    
    return NextResponse.json(apps.map(app => ({
      id: app.id,
      name: app.name,
      description: app.description,
      clientId: app.clientId,
      redirectUri: app.callbackUrl,
      createdAt: app.createdAt
    })));
  } catch (error) {
    console.error("OAuth apps GET error:", error);
    return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, description, homepageUrl, callbackUrl } = body;

    if (!userId || !name || !homepageUrl || !callbackUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const clientId = nanoid(32);
    const clientSecret = nanoid(64);

    const [app] = await db.insert(oauthApp).values({
      userId,
      name,
      description: description || null,
      clientId,
      clientSecret,
      homepageUrl,
      callbackUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();

    return NextResponse.json({ success: true, app });
  } catch (error) {
    console.error("OAuth apps POST error:", error);
    return NextResponse.json({ error: "Failed to create app" }, { status: 500 });
  }
}
