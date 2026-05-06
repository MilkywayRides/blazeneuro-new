import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { coursePages } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.user.id)
    })

    if (!userRecord || userRecord.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { pages } = await req.json()

    for (const page of pages) {
      await db
        .update(coursePages)
        .set({ order: page.order })
        .where(eq(coursePages.id, page.id))
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Reorder pages error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
