import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { oauthApp, oauthAuthorization } from "@/lib/schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const client_id = formData.get("client_id") as string;
  const redirect_uri = formData.get("redirect_uri") as string;
  const scope = formData.get("scope") as string || "profile email";
  const state = formData.get("state") as string;

  const app = await db.select().from(oauthApp).where(eq(oauthApp.clientId, client_id)).limit(1);

  if (!app[0]) {
    return NextResponse.json({ error: "Invalid client" }, { status: 400 });
  }

  // Generate authorization code
  const code = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(oauthAuthorization).values({
    id: randomBytes(16).toString("hex"),
    code,
    userId: session.user.id,
    appId: app[0].id,
    scope,
    redirectUri: redirect_uri,
    expiresAt,
    createdAt: new Date(),
  });

  // Redirect back to app with code
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", code);
  if (state) {
    redirectUrl.searchParams.set("state", state);
  }

  return NextResponse.redirect(redirectUrl.toString());
}
