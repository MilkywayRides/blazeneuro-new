import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { coursePages } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; pageId: string }> }
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

    const { pageId } = await params
    const { title, contentType, body, videoUrl } = await req.json()

    const [page] = await db
      .update(coursePages)
      .set({ title, contentType, body, videoUrl })
      .where(eq(coursePages.id, pageId))
      .returning()

    return NextResponse.json(page)
  } catch (error: any) {
    console.error("Update page error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; pageId: string }> }
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

    const { pageId } = await params

    await db.delete(coursePages).where(eq(coursePages.id, pageId))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete page error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
