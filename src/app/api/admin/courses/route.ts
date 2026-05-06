import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth-server"

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    
    const { title, type } = await req.json()

    const [course] = await db.insert(courses).values({
      title,
      type: type || "FREE"
    }).returning()

    return NextResponse.json(course)
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error("Admin courses POST error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        type: courses.type,
        createdAt: courses.createdAt,
        pageCount: sql<number>`count(${coursePages.id})::int`
      })
      .from(courses)
      .leftJoin(coursePages, eq(courses.id, coursePages.courseId))
      .groupBy(courses.id)

    return NextResponse.json(result)
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error("Admin courses GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
