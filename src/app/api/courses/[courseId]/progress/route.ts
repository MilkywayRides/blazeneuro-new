import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courseProgress } from "@/lib/schema"
import { eq, and } from "drizzle-orm"
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

    const { pageId, completed } = await req.json()

    const existing = await db.query.courseProgress.findFirst({
      where: (cp, { and, eq }) => and(
        eq(cp.userId, session.user.id),
        eq(cp.pageId, pageId)
      )
    })

    if (existing) {
      await db
        .update(courseProgress)
        .set({ completed, updatedAt: new Date() })
        .where(and(
          eq(courseProgress.userId, session.user.id),
          eq(courseProgress.pageId, pageId)
        ))
    } else {
      await db.insert(courseProgress).values({
        userId: session.user.id,
        pageId,
        completed
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Update progress error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
