import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages, user } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { eq, asc } from "drizzle-orm"

async function getAdminUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  
  if (!session?.user) throw new Error("No session")

  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id))
  if (!dbUser) throw new Error("User not found")
  if (dbUser.role !== "admin") throw new Error(`Not admin. Role: ${dbUser.role}`)

  return dbUser
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await getAdminUser(req)
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
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
