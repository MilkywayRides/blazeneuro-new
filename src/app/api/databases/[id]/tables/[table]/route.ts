import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { database } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string; table: string }> }) {
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

    // Get table data (limit to 100 rows)
    const result = await db.execute(sql.raw(`
      SELECT * FROM "${dbRecord[0].schemaName}"."${params.table}" LIMIT 100
    `));

    // Get column info
    const columnsResult = await db.execute(sql.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = '${dbRecord[0].schemaName}' 
      AND table_name = '${params.table}'
      ORDER BY ordinal_position
    `));

    return NextResponse.json({ 
      rows: Array.from(result),
      columns: Array.from(columnsResult),
      count: result.length || 0
    });
  } catch (error) {
    console.error("Failed to get table data:", error);
    return NextResponse.json({ error: "Failed to get table data" }, { status: 500 });
  }
}
