import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages, user, session } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"

async function getAdminUser(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || ""
  const sessionToken = cookieHeader.split(";").find(c => c.trim().startsWith("better-auth.session_token="))?.split("=")[1]
  
  if (!sessionToken) {
    throw new Error("No session")
  }

  const [userSession] = await db.select().from(session).where(eq(session.token, sessionToken))
  
  if (!userSession) {
    throw new Error("Invalid session")
  }

  const [dbUser] = await db.select().from(user).where(eq(user.id, userSession.userId))
  
  if (!dbUser || dbUser.role !== "admin") {
    throw new Error("Not admin")
  }

  return dbUser
}

export async function POST(req: NextRequest) {
  try {
    await getAdminUser(req)
    
    const { title, type } = await req.json()

    const [course] = await db.insert(courses).values({
      title,
      type: type || "FREE"
    }).returning()

    return NextResponse.json(course)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await getAdminUser(req)

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
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
