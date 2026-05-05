import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { coursePages } from "@/lib/schema"
import { eq, max } from "drizzle-orm"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const sessionToken = req.cookies.get('better-auth.session_token')?.value
    
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

    const { courseId } = await params
    const { title, contentType, body, videoUrl } = await req.json()

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
      order
    }).returning()

    return NextResponse.json(page)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
