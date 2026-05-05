import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages, user } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { eq, sql } from "drizzle-orm"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id))
  
  if (!dbUser || dbUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, type } = await req.json()

  const [course] = await db.insert(courses).values({
    title,
    type: type || "FREE"
  }).returning()

  return NextResponse.json(course)
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  
  if (!session?.user) {
    return NextResponse.json({ error: "No session" }, { status: 401 })
  }

  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id))
  
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 401 })
  }

  if (dbUser.role !== "admin") {
    return NextResponse.json({ error: `Not admin. Role: ${dbUser.role}` }, { status: 401 })
  }

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
}
