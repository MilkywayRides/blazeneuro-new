import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages } from "@/lib/schema"
import { verifyAdminRequest, handleApiError, createSecureResponse } from "@/lib/api-auth"
import { eq, asc } from "drizzle-orm"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await verifyAdminRequest(req)
    const { courseId } = await params

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId))
    
    if (!course) {
      return createSecureResponse({ error: "Course not found" }, 404)
    }

    const pages = await db
      .select()
      .from(coursePages)
      .where(eq(coursePages.courseId, courseId))
      .orderBy(asc(coursePages.order))

    return createSecureResponse({ ...course, pages })
  } catch (error) {
    return handleApiError(error)
  }
}
