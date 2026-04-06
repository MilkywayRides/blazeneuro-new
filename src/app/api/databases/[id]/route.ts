import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { database } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;

  try {
    const dbRecord = await db.select().from(database).where(eq(database.id, params.id)).limit(1);
    
    if (dbRecord.length === 0 || dbRecord[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    // Drop the schema
    await db.execute(sql.raw(`DROP SCHEMA IF EXISTS ${dbRecord[0].schemaName} CASCADE`));
    
    // Drop the PostgreSQL user
    await db.execute(sql.raw(`DROP USER IF EXISTS ${dbRecord[0].username}`));
    
    // Delete from database table
    await db.delete(database).where(eq(database.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete database:", error);
    return NextResponse.json({ error: "Failed to delete database" }, { status: 500 });
  }
}
