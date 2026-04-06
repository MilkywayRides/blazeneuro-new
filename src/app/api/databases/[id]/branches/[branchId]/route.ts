import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { database, databaseBranch } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string; branchId: string }> }) {
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

    const branch = await db.select().from(databaseBranch).where(eq(databaseBranch.id, params.branchId)).limit(1);
    
    if (branch.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    // Drop the branch schema
    await db.execute(sql.raw(`DROP SCHEMA IF EXISTS "${branch[0].schemaName}" CASCADE`));
    
    // Delete from database
    await db.delete(databaseBranch).where(eq(databaseBranch.id, params.branchId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete branch:", error);
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}
