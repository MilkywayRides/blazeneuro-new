import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courseEnrollments, user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.user.id)
    })

    if (!userRecord || userRecord.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { courseId } = await params

    try {
      const enrollments = await db
        .select({
          id: courseEnrollments.id,
          userId: courseEnrollments.userId,
          enrolledAt: courseEnrollments.enrolledAt,
          name: user.name,
          email: user.email
        })
        .from(courseEnrollments)
        .innerJoin(user, eq(courseEnrollments.userId, user.id))
        .where(eq(courseEnrollments.courseId, courseId))

      const users = enrollments.map(e => ({
        id: e.userId,
        name: e.name || 'Unknown',
        email: e.email || 'N/A',
        enrolledAt: e.enrolledAt
      }))

      return NextResponse.json({ users, count: users.length })
    } catch (error: any) {
      console.error("Enrollment fetch error:", error)
      if (error.code === '42P01') {
        return NextResponse.json({ users: [], count: 0, warning: 'Table not created yet' })
      }
      return NextResponse.json({ users: [], count: 0, error: error.message })
    }
  } catch (error: any) {
    console.error("Get enrollments error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
