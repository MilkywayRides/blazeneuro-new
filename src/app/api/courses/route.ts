import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses, coursePages } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"

export async function GET() {
  const result = await db
    .select({
      id: courses.id,
      title: courses.title,
      type: courses.type,
      price: courses.price,
      coverImage: courses.coverImage,
      pageCount: sql<number>`count(${coursePages.id})::int`
    })
    .from(courses)
    .leftJoin(coursePages, eq(courses.id, coursePages.courseId))
    .groupBy(courses.id, courses.title, courses.type, courses.price, courses.coverImage)

  return NextResponse.json(result)
}
