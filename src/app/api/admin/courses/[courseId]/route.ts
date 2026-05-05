import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const sessionToken = req.cookies.get('better-auth.session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await db.query.session.findFirst({
      where: (s, { eq }) => eq(s.token, sessionToken)
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.userId)
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
