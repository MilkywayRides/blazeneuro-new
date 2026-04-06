import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { database } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const body = await req.json();
  const { password } = body;

  try {
    const dbRecord = await db.select().from(database).where(eq(database.id, params.id)).limit(1);
    
    if (dbRecord.length === 0 || dbRecord[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    // Update PostgreSQL user password
    await db.execute(sql.raw(`ALTER USER "${dbRecord[0].username}" WITH PASSWORD '${password}'`));
    
    // Update connection string
    const baseUrl = process.env.DATABASE_URL!.split('@')[1];
    const connectionString = `postgresql://${dbRecord[0].username}:${password}@${baseUrl}?schema=${dbRecord[0].schemaName}`;

    // Update in database
    await db.update(database)
      .set({ 
        password,
        connectionString,
        updatedAt: new Date()
      })
      .where(eq(database.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update password:", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
