import { NextRequest, NextResponse } from "next/server";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.blazeneuro.com";

export async function GET(request: NextRequest) {
  const cookie = request.headers.get("cookie");
  
  if (!cookie) {
    return NextResponse.json({ user: null, session: null }, { status: 200 });
  }

  try {
    const response = await fetch(`${AUTH_URL}/api/auth/session`, {
      headers: {
        cookie,
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    const text = await response.text();
    
    if (!text || text.trim() === '') {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    const data = JSON.parse(text);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Session API] Error:", error);
    return NextResponse.json({ user: null, session: null }, { status: 200 });
  }
}
