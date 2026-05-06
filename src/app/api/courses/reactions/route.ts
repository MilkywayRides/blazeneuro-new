import { db } from "@/lib/db"
import { coursePageReactions } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"

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
    // Update existing reaction
    await db.update(coursePageReactions)
      .set({ liked })
      .where(eq(coursePageReactions.id, existing.id))
  } else {
    // Create new reaction
    await db.insert(coursePageReactions).values({
      userId: session.user.id,
      pageId,
      liked
    })
  }

  return Response.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { pageId } = await req.json()

  await db.delete(coursePageReactions)
    .where(and(
      eq(coursePageReactions.userId, session.user.id),
      eq(coursePageReactions.pageId, pageId)
    ))

  return Response.json({ success: true })
}
