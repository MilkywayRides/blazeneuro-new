import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { coursePages } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { eq, max } from "drizzle-orm"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  const session = await auth.api.getSession({ headers: req.headers })
  
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
}
