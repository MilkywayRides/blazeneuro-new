import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json()
    
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "deviceLocation" (
        "id" text PRIMARY KEY NOT NULL,
        "userId" text,
        "deviceId" text NOT NULL,
        "latitude" text NOT NULL,
        "longitude" text NOT NULL,
        "lastSeen" timestamp DEFAULT now() NOT NULL
      )
    `)

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "deviceLocation_deviceId_idx" ON "deviceLocation" ("deviceId")
    `)

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "deviceLocation_lastSeen_idx" ON "deviceLocation" ("lastSeen")
    `)

    return NextResponse.json({ success: true, message: 'Table created' })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
