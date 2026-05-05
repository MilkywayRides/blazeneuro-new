import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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
}
