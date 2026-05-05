import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { coursePages } from "@/lib/schema"
import { verifyAdminRequest, handleApiError, createSecureResponse } from "@/lib/api-auth"
import { eq, max } from "drizzle-orm"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await verifyAdminRequest(req)
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

    return createSecureResponse(page)
  } catch (error) {
    return handleApiError(error)
  }
}
