import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages } from "@/lib/schema"
import { verifyAdminRequest, handleApiError, createSecureResponse } from "@/lib/api-auth"
import { eq, sql } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    await verifyAdminRequest(req)
    
    const { title, type } = await req.json()

    const [course] = await db.insert(courses).values({
      title,
      type: type || "FREE"
    }).returning()

    return createSecureResponse(course)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdminRequest(req)

    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        type: courses.type,
        createdAt: courses.createdAt,
        pageCount: sql<number>`count(${coursePages.id})::int`
      })
      .from(courses)
      .leftJoin(coursePages, eq(courses.id, coursePages.courseId))
      .groupBy(courses.id)

    return createSecureResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
