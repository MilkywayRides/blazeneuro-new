import { db } from "@/lib/db"
import { coursePageReactions, coursePages } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and, sql } from "drizzle-orm"

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { pageId, liked } = await req.json()

  // Check if reaction exists
  const existing = await db.query.coursePageReactions.findFirst({
    where: and(
      eq(coursePageReactions.userId, session.user.id),
      eq(coursePageReactions.pageId, pageId)
    )
  })

  if (existing) {
    const oldLiked = existing.liked
    // Update existing reaction
    await db.update(coursePageReactions)
      .set({ liked })
      .where(eq(coursePageReactions.id, existing.id))
    
    // Update counts
    if (oldLiked !== liked) {
      if (liked) {
        await db.update(coursePages)
          .set({ 
            likeCount: sql`${coursePages.likeCount} + 1`,
            dislikeCount: sql`${coursePages.dislikeCount} - 1`
          })
          .where(eq(coursePages.id, pageId))
      } else {
        await db.update(coursePages)
          .set({ 
            likeCount: sql`${coursePages.likeCount} - 1`,
            dislikeCount: sql`${coursePages.dislikeCount} + 1`
          })
          .where(eq(coursePages.id, pageId))
      }
    }
  } else {
    // Create new reaction
    await db.insert(coursePageReactions).values({
      userId: session.user.id,
      pageId,
      liked
    })
    
    // Update counts
    if (liked) {
      await db.update(coursePages)
        .set({ likeCount: sql`${coursePages.likeCount} + 1` })
        .where(eq(coursePages.id, pageId))
    } else {
      await db.update(coursePages)
        .set({ dislikeCount: sql`${coursePages.dislikeCount} + 1` })
        .where(eq(coursePages.id, pageId))
    }
  }

  return Response.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { pageId } = await req.json()

  const existing = await db.query.coursePageReactions.findFirst({
    where: and(
      eq(coursePageReactions.userId, session.user.id),
      eq(coursePageReactions.pageId, pageId)
    )
  })

  if (existing) {
    await db.delete(coursePageReactions)
      .where(eq(coursePageReactions.id, existing.id))
    
    // Update counts
    if (existing.liked) {
      await db.update(coursePages)
        .set({ likeCount: sql`${coursePages.likeCount} - 1` })
        .where(eq(coursePages.id, pageId))
    } else {
      await db.update(coursePages)
        .set({ dislikeCount: sql`${coursePages.dislikeCount} - 1` })
        .where(eq(coursePages.id, pageId))
    }
  }

  return Response.json({ success: true })
}
