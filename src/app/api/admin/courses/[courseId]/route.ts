import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await params

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId))
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const pages = await db
      .select()
      .from(coursePages)
      .where(eq(coursePages.courseId, courseId))
      .orderBy(asc(coursePages.order))

    return NextResponse.json({ ...course, pages })
  } catch (error: any) {
    console.error("Get course error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
