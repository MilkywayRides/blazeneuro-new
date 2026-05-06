import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages, courseProgress, courseEnrollments, coursePageReactions } from "@/lib/schema"
import { eq, asc, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId))
  
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  const pages = await db
    .select()
    .from(coursePages)
    .where(eq(coursePages.courseId, courseId))
    .orderBy(asc(coursePages.order))

  // Get user progress if authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session?.user) {
    // Auto-enroll user if not already enrolled (only on first access)
    try {
      const existing = await db.query.courseEnrollments.findFirst({
        where: (ce, { and, eq }) => and(
          eq(ce.userId, session.user.id),
          eq(ce.courseId, courseId)
        )
      })

      if (!existing) {
        await db.insert(courseEnrollments).values({
          userId: session.user.id,
          courseId
        }).catch(() => {}) // Silently fail if table doesn't exist
      }
    } catch (error) {
      // Ignore enrollment errors
    }

    try {
      const progressRecords = await db
        .select()
        .from(courseProgress)
        .where(eq(courseProgress.userId, session.user.id))

      const reactionRecords = await db
        .select()
        .from(coursePageReactions)
        .where(eq(coursePageReactions.userId, session.user.id))

      const pagesWithProgress = pages.map(page => {
        const progress = progressRecords.find(p => p.pageId === page.id)
        const reaction = reactionRecords.find(r => r.pageId === page.id)
        return { 
          ...page, 
          completed: progress?.completed || false,
          userReaction: reaction ? reaction.liked : null
        }
      })

      return NextResponse.json({ ...course, pages: pagesWithProgress })
    } catch (error) {
      console.error("Progress fetch error:", error)
      // If table doesn't exist yet, return pages without progress
      return NextResponse.json({ ...course, pages: pages.map(p => ({ ...p, completed: false, userReaction: null })) })
    }
  }

  return NextResponse.json({ ...course, pages: pages.map(p => ({ ...p, completed: false, userReaction: null })) })
}
