import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    let sessionToken = req.cookies.get('__Secure-better-auth.session_token')?.value
    if (!sessionToken) {
      sessionToken = req.cookies.get('better-auth.session_token')?.value
    }
    
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
    
    const { title, type } = await req.json()

    const [course] = await db.insert(courses).values({
      title,
      type: type || "FREE"
    }).returning()

    return NextResponse.json(course)
  } catch (error: any) {
    console.error("Admin courses POST error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    let sessionToken = req.cookies.get('__Secure-better-auth.session_token')?.value
    if (!sessionToken) {
      sessionToken = req.cookies.get('better-auth.session_token')?.value
    }
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await db.query.session.findFirst({
      where: (s, { eq }) => eq(s.token, sessionToken)
    })

    if (!session) {
      console.log('Session not found in database for token:', sessionToken.substring(0, 10))
      return NextResponse.json({ error: 'Unauthorized - Invalid session' }, { status: 401 })
    }

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.userId)
    })

    if (!userRecord) {
      console.log('User not found for session userId:', session.userId)
      return NextResponse.json({ error: 'Unauthorized - User not found' }, { status: 401 })
    }

    if (userRecord.role !== 'admin') {
      console.log('User is not admin. Role:', userRecord.role)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
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
    console.error("Admin courses GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
