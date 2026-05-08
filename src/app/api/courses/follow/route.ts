import { db } from "@/lib/db"
import { courseFollows } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { publisherId } = await req.json()

  const existing = await db.query.courseFollows.findFirst({
    where: and(
      eq(courseFollows.userId, session.user.id),
      eq(courseFollows.publisherId, publisherId)
    )
  })

  if (!existing) {
    await db.insert(courseFollows).values({
      userId: session.user.id,
      publisherId
    })
  }

  return Response.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { publisherId } = await req.json()

  await db.delete(courseFollows)
    .where(
      and(
        eq(courseFollows.userId, session.user.id),
        eq(courseFollows.publisherId, publisherId)
      )
    )

  return Response.json({ success: true })
}
