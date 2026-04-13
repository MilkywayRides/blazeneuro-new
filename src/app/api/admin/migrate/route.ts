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
      CREATE TABLE IF NOT EXISTS "popup" (
        "id" text PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "components" text NOT NULL,
        "active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `)

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "popup_response" (
        "id" text PRIMARY KEY NOT NULL,
        "popup_id" text NOT NULL,
        "device_id" text NOT NULL,
        "response" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `)

    return NextResponse.json({ success: true, message: 'Tables created' })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
