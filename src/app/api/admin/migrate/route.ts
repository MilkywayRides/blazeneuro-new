import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.user.id)
    })

    if (!userRecord || userRecord.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create course_progress table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "course_progress" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL,
        "page_id" uuid NOT NULL REFERENCES "course_pages"("id") ON DELETE CASCADE,
        "completed" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `)

    // Create course_enrollments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "course_enrollments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "enrolled_at" timestamp DEFAULT now() NOT NULL,
        UNIQUE("user_id", "course_id")
      )
    `)

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "course_progress_user_id_idx" ON "course_progress"("user_id")
    `)

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "course_progress_page_id_idx" ON "course_progress"("page_id")
    `)

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "course_enrollments_user_id_idx" ON "course_enrollments"("user_id")
    `)

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "course_enrollments_course_id_idx" ON "course_enrollments"("course_id")
    `)

    return NextResponse.json({ success: true, message: "Migration completed" })
  } catch (error: any) {
    console.error("Migration error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
