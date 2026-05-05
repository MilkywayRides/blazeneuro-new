import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages, user } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { eq, sql } from "drizzle-orm"

async function getAdminUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  
  if (!session?.user) {
    throw new Error("No session")
  }

  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id))
  
  if (!dbUser) {
    throw new Error("User not found")
  }
  
  if (dbUser.role !== "admin") {
    throw new Error(`Not admin. Role: ${dbUser.role}`)
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
    console.error("Admin courses POST error:", error.message)
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
    console.error("Admin courses GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
