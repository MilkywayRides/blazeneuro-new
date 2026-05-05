import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages, user, session } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

async function getAdminUser(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || ""
  const sessionToken = cookieHeader.split(";").find(c => c.trim().startsWith("better-auth.session_token="))?.split("=")[1]
  
  if (!sessionToken) throw new Error("No session")

  const [userSession] = await db.select().from(session).where(eq(session.token, sessionToken))
  if (!userSession) throw new Error("Invalid session")

  const [dbUser] = await db.select().from(user).where(eq(user.id, userSession.userId))
  if (!dbUser || dbUser.role !== "admin") throw new Error("Not admin")

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
