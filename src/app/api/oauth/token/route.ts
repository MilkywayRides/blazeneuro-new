import { db } from "@/lib/db";
import { oauthApp, oauthAuthorization, oauthToken, user } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const grant_type = formData.get("grant_type") as string;
  const code = formData.get("code") as string;
  const client_id = formData.get("client_id") as string;
  const client_secret = formData.get("client_secret") as string;
  const redirect_uri = formData.get("redirect_uri") as string;

  if (grant_type !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  // Verify client credentials
  const app = await db
    .select()
    .from(oauthApp)
    .where(eq(oauthApp.clientId, client_id))
    .limit(1);

  if (!app[0] || app[0].clientSecret !== client_secret) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  // Verify authorization code
  const authorization = await db
    .select()
    .from(oauthAuthorization)
    .where(eq(oauthAuthorization.code, code))
    .limit(1);

  if (!authorization[0]) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  if (authorization[0].expiresAt < new Date()) {
    return NextResponse.json({ error: "expired_token" }, { status: 400 });
  }

  if (authorization[0].redirectUri !== redirect_uri) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  // Generate access token
  const accessToken = randomBytes(32).toString("hex");
  const refreshToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

  await db.insert(oauthToken).values({
    id: randomBytes(16).toString("hex"),
    accessToken,
    refreshToken,
    userId: authorization[0].userId,
    appId: authorization[0].appId,
    scope: authorization[0].scope,
    expiresAt,
    createdAt: new Date(),
  });

  // Delete used authorization code
  await db.delete(oauthAuthorization).where(eq(oauthAuthorization.id, authorization[0].id));

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: authorization[0].scope,
  });
}
