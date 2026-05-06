import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courseFollows } from "@/lib/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId } = await params
  
  // Get course to find publisher
  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, courseId)
  })
  
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  if (!course.publisherId) {
    return NextResponse.json({ error: "Course has no publisher" }, { status: 400 })
  }

  try {
    await db.insert(courseFollows).values({
      userId: session.user.id,
      publisherId: course.publisherId
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Already following" }, { status: 400 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId } = await params
  
  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, courseId)
  })
  
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  if (!course.publisherId) {
    return NextResponse.json({ error: "Course has no publisher" }, { status: 400 })
  }

  await db.delete(courseFollows).where(
    and(
      eq(courseFollows.userId, session.user.id),
      eq(courseFollows.publisherId, course.publisherId)
    )
  )

  return NextResponse.json({ success: true })
}
