import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { coursePages } from "@/lib/schema"
import { eq, max } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(
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
    const { title, contentType, body, videoUrl, quizData } = await req.json()

    const [maxOrder] = await db
      .select({ max: max(coursePages.order) })
      .from(coursePages)
      .where(eq(coursePages.courseId, courseId))

    const order = (maxOrder?.max ?? -1) + 1

    const [page] = await db.insert(coursePages).values({
      courseId,
      title,
      contentType,
      body,
      videoUrl,
      quizData,
      order
    }).returning()

    return NextResponse.json(page)
  } catch (error: any) {
    console.error("Add page error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
