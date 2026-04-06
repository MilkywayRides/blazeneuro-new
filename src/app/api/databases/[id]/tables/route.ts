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

  console.log("=== TABLES API CALLED ===");
  console.log("Database ID:", params.id);

  try {
    const dbRecord = await db.select().from(database).where(eq(database.id, params.id)).limit(1);
    
    console.log("DB Record found:", dbRecord.length);
    
    if (dbRecord.length === 0 || dbRecord[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    const schemaName = dbRecord[0].schemaName;
    console.log("Schema name:", schemaName);

    // Get all tables in the schema
    const result = await db.execute(sql.raw(`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size(quote_ident('${schemaName}') || '.' || quote_ident(tablename))) as size
      FROM pg_tables
      WHERE schemaname = '${schemaName}'
      ORDER BY tablename
    `));

    // Result is an array-like object, convert to array
    const tables = Array.from(result);

    return NextResponse.json({ tables });
  } catch (error) {
    console.error("Failed to get tables:", error);
    return NextResponse.json({ error: "Failed to get tables" }, { status: 500 });
  }
}
