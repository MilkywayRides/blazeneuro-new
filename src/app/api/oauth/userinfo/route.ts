import { db } from "@/lib/db";
import { oauthToken, user } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const accessToken = authHeader.substring(7);

  const token = await db
    .select()
    .from(oauthToken)
    .where(eq(oauthToken.accessToken, accessToken))
    .limit(1);

  if (!token[0] || token[0].expiresAt < new Date()) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, token[0].userId))
    .limit(1);

  if (!userData[0]) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const scopes = token[0].scope.split(" ");
  const response: any = {
    sub: userData[0].id,
  };

  if (scopes.includes("profile")) {
    response.name = userData[0].name;
    response.picture = userData[0].image;
  }

  if (scopes.includes("email")) {
    response.email = userData[0].email;
    response.email_verified = userData[0].emailVerified;
  }

  return NextResponse.json(response);
}
