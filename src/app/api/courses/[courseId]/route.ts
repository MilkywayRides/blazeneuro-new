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

  console.log("Course publisherId:", course.publisherId)

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
    console.log("Publisher found:", publisher)
  } else {
    console.log("No publisherId on course")
  }

  // Get user progress and purchase status if authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  })

  let isPurchased = course.type === "FREE"
  if (session?.user && course.type === "PAID") {
    const purchase = await db.query.coursePurchases.findFirst({
      where: (cp, { and, eq }) => and(
        eq(cp.userId, session.user.id),
        eq(cp.courseId, courseId)
      )
    })
    isPurchased = !!purchase
  }

  // Restrict pages if not purchased
  const restrictedPages = pages.map((page, index) => {
    if (isPurchased || index === 0) {
      return page
    }
    // Hide content for restricted pages
    return {
      ...page,
      body: null,
      videoUrl: null,
      quizData: null,
      isLocked: true
    }
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

    // Auto-enroll user if not already enrolled (only on first access or free course)
    try {
      const existing = await db.query.courseEnrollments.findFirst({
        where: (ce, { and, eq }) => and(
          eq(ce.userId, session.user.id),
          eq(ce.courseId, courseId)
        )
      })

      if (!existing && (course.type === "FREE" || isPurchased)) {
        await db.insert(courseEnrollments).values({
          userId: session.user.id,
          courseId
        }).catch(() => {}) 
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

      const pagesWithProgress = restrictedPages.map(page => {
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
        isPurchased,
        pages: pagesWithProgress 
      })
    } catch (error) {
      console.error("Progress fetch error:", error)
      return NextResponse.json({ 
        ...course, 
        publisher,
        isFollowing,
        isPurchased,
        pages: restrictedPages.map(p => ({ ...p, completed: false, userReaction: null, likeCount: p.likeCount || 0, dislikeCount: p.dislikeCount || 0 })) 
      })
    }
  }

  return NextResponse.json({ 
    ...course, 
    publisher,
    isFollowing,
    isPurchased,
    pages: restrictedPages.map(p => ({ ...p, completed: false, userReaction: null, likeCount: p.likeCount || 0, dislikeCount: p.dislikeCount || 0 })) 
  })
}
