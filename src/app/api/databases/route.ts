import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { database } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, region } = body;

  try {
    const dbId = nanoid();
    const schemaName = `db_${dbId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    // Generate credentials
    const username = `user_${nanoid(12).toLowerCase()}`;
    const password = nanoid(32);
    
    // Create PostgreSQL schema
    await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`));
    
    // Create PostgreSQL user with password
    await db.execute(sql.raw(`CREATE USER "${username}" WITH PASSWORD '${password}'`));
    
    // Grant permissions on schema to user
    await db.execute(sql.raw(`GRANT ALL PRIVILEGES ON SCHEMA ${schemaName} TO "${username}"`));
    await db.execute(sql.raw(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ${schemaName} TO "${username}"`));
    await db.execute(sql.raw(`ALTER DEFAULT PRIVILEGES IN SCHEMA ${schemaName} GRANT ALL ON TABLES TO "${username}"`));
    
    // Generate connection string with credentials
    const baseUrl = process.env.DATABASE_URL!.split('@')[1];
    const connectionString = `postgresql://${username}:${password}@${baseUrl}?schema=${schemaName}`;

    const newDatabase = await db.insert(database).values({
      id: dbId,
      name,
      userId: session.user.id,
      schemaName,
      username,
      password,
      region,
      connectionString,
      status: "active",
    }).returning();

    return NextResponse.json(newDatabase[0]);
  } catch (error) {
    console.error("Failed to create database:", error);
    return NextResponse.json({ error: "Failed to create database" }, { status: 500 });
  }
}
