import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { coursePages, user } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { eq, max } from "drizzle-orm"

async function getAdminUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  
  if (!session?.user) throw new Error("No session")

  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id))
  if (!dbUser) throw new Error("User not found")
  if (dbUser.role !== "admin") throw new Error(`Not admin. Role: ${dbUser.role}`)

  return dbUser
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await getAdminUser(req)
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
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
