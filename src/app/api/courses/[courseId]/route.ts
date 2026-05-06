import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages, courseProgress, courseEnrollments, coursePageReactions, courseFollows } from "@/lib/schema"
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

  // Get publisher info
  let publisher = null
  let isFollowing = false
  
  if (course.publisherId) {
    publisher = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, course.publisherId!),
      columns: {
        id: true,
        name: true,
        image: true
      }
    })
  }

  // Get user progress if authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session?.user && course.publisherId) {
    // Check if following
    const followRecord = await db.query.courseFollows.findFirst({
      where: (cf, { and, eq }) => and(
        eq(cf.userId, session.user.id),
        eq(cf.publisherId, course.publisherId!)
      )
    })
    isFollowing = !!followRecord

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
          userReaction: reaction ? reaction.liked : null,
          likeCount: page.likeCount || 0,
          dislikeCount: page.dislikeCount || 0
        }
      })

      return NextResponse.json({ 
        ...course, 
        publisher,
        isFollowing,
        pages: pagesWithProgress 
      })
    } catch (error) {
      console.error("Progress fetch error:", error)
      // If table doesn't exist yet, return pages without progress
      return NextResponse.json({ 
        ...course, 
        publisher,
        isFollowing,
        pages: pages.map(p => ({ ...p, completed: false, userReaction: null, likeCount: p.likeCount || 0, dislikeCount: p.dislikeCount || 0 })) 
      })
    }
  }

  return NextResponse.json({ 
    ...course, 
    publisher,
    isFollowing,
    pages: pages.map(p => ({ ...p, completed: false, userReaction: null, likeCount: p.likeCount || 0, dislikeCount: p.dislikeCount || 0 })) 
  })
}
