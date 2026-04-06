import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { githubConnection } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

const GITHUB_CLIENT_ID = process.env.GITHUB_DEPLOY_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_DEPLOY_CLIENT_SECRET!;

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  
  if (!code) {
    return NextResponse.redirect(new URL("/admin/deploy?error=no_code", req.url));
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error("No access token received");
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const githubUser = await userResponse.json();

    await db.insert(githubConnection).values({
      id: nanoid(),
      userId: session.user.id,
      githubId: githubUser.id.toString(),
      username: githubUser.login,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      avatarUrl: githubUser.avatar_url,
    });

    return NextResponse.redirect(new URL("/admin/deploy?connected=true", req.url));
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(new URL("/admin/deploy?error=oauth_failed", req.url));
  }
}
