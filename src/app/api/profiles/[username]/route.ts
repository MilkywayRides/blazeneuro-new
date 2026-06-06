import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.username, username),
      columns: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true
      }
    })

    if (!userRecord) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Also fetch courses published by this user
    const userCourses = await db.query.courses.findMany({
      where: (c, { eq }) => eq(c.publisherId, userRecord.id)
    })

    return NextResponse.json({
      ...userRecord,
      courses: userCourses
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
