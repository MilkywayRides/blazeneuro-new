import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages, user } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { eq, asc } from "drizzle-orm"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  const session = await auth.api.getSession({ headers: req.headers })
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id))
  
  if (!dbUser || dbUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
