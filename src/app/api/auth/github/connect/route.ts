import { NextRequest, NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_DEPLOY_CLIENT_ID!;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "http://localhost:3001/api/auth/github/callback";

export async function GET(req: NextRequest) {
  const scope = "repo,user:email,read:user";
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=${scope}`;
  
  return NextResponse.redirect(githubAuthUrl);
}
