import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role from database directly
    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.user.id)
    })

    if (!userRecord || userRecord.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { title, type } = await req.json()

    const [course] = await db.insert(courses).values({
      title,
      type: type || "FREE"
    }).returning()

    return NextResponse.json(course)
  } catch (error: any) {
    console.error("Admin courses POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role from database directly
    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.user.id)
    })

    console.log('User record from DB:', userRecord)

    if (!userRecord) {
      return NextResponse.json({ 
        error: 'User not found',
        userId: session.user.id
      }, { status: 403 })
    }

    if (userRecord.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Forbidden - Not admin',
        role: userRecord.role
      }, { status: 403 })
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
  } catch (error: any) {
    console.error("Admin courses GET error:", error)
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}
