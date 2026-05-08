import { db } from "@/lib/db"
import { coursePageReactions, coursePages } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
import { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  const [page] = await db.select({
    likeCount: coursePages.likeCount,
    dislikeCount: coursePages.dislikeCount
  }).from(coursePages).where(eq(coursePages.id, pageId))

  if (!page) {
    return Response.json({ 
      reaction: null, 
      likeCount: 0, 
      dislikeCount: 0 
    })
  }

  let reaction = null
  if (session?.user) {
    const userReaction = await db.query.coursePageReactions.findFirst({
      where: and(
        eq(coursePageReactions.userId, session.user.id),
        eq(coursePageReactions.pageId, pageId)
      )
    })
    reaction = userReaction ? userReaction.liked : null
  }

  return Response.json({
    reaction,
    likeCount: page.likeCount || 0,
    dislikeCount: page.dislikeCount || 0
  })
}
