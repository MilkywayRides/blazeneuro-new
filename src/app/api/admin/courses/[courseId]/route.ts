import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function PUT(
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
    const { title, type } = await req.json()

    const [course] = await db
      .update(courses)
      .set({ title, type })
      .where(eq(courses.id, courseId))
      .returning()

    return NextResponse.json(course)
  } catch (error: any) {
    console.error("Update course error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
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

    await db.delete(courses).where(eq(courses.id, courseId))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete course error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
