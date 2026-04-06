import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { database, databaseBranch } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const body = await req.json();
  const { name, copyData } = body;

  try {
    const dbRecord = await db.select().from(database).where(eq(database.id, params.id)).limit(1);
    
    if (dbRecord.length === 0 || dbRecord[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    const branchId = nanoid();
    const schemaName = `${dbRecord[0].schemaName}_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    // Create new schema for branch
    await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`));
    
    // Copy tables from main schema to branch if requested
    if (copyData) {
      const tables = await db.execute(sql.raw(`
        SELECT tablename FROM pg_tables WHERE schemaname = '${dbRecord[0].schemaName}'
      `));
      
      for (const table of Array.from(tables)) {
        await db.execute(sql.raw(`
          CREATE TABLE "${schemaName}"."${(table as any).tablename}" 
          AS SELECT * FROM "${dbRecord[0].schemaName}"."${(table as any).tablename}"
        `));
      }
    }

    // Generate connection string for branch
    const baseUrl = process.env.DATABASE_URL!.split('@')[1];
    const connectionString = `postgresql://${dbRecord[0].username}:${dbRecord[0].password}@${baseUrl}?schema=${schemaName}`;

    const newBranch = await db.insert(databaseBranch).values({
      id: branchId,
      databaseId: params.id,
      name,
      schemaName,
      connectionString,
      isDefault: false,
    }).returning();

    return NextResponse.json(newBranch[0]);
  } catch (error) {
    console.error("Failed to create branch:", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
