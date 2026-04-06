import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;
  const app = await db.select().from(oauthApp).where(eq(oauthApp.id, id)).limit(1);

  if (!app[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(app[0]);
}
