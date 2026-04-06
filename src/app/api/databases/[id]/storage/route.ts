import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { database } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
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

    // Get schema size from PostgreSQL
    const result = await db.execute(sql.raw(`
      SELECT 
        COALESCE(sum(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))), 0)::bigint as size_bytes
      FROM pg_tables
      WHERE schemaname = '${dbRecord[0].schemaName}'
    `));

    const resultArray = Array.from(result);
    console.log("Storage result:", resultArray);
    
    const sizeBytes = resultArray[0]?.size_bytes || 0;
    const sizeMB = (Number(sizeBytes) / (1024 * 1024)).toFixed(2);

    console.log("Size bytes:", sizeBytes, "Size MB:", sizeMB);

    // Update storage in database
    await db.update(database)
      .set({ storageUsed: sizeMB })
      .where(eq(database.id, params.id));

    return NextResponse.json({ 
      storageUsed: sizeMB,
      storageBytes: sizeBytes
    });
  } catch (error) {
    console.error("Failed to get storage:", error);
    return NextResponse.json({ error: "Failed to get storage" }, { status: 500 });
  }
}
