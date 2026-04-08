import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  
  return NextResponse.json({ role: dbUser[0]?.role || "user" });
}
