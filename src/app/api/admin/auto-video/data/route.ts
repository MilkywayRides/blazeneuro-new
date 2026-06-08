import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { uploadedFiles, clips } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const files = await db.query.uploadedFiles.findMany({
      where: (f, { eq }) => eq(f.userId, session.user.id),
      orderBy: [desc(uploadedFiles.createdAt)]
    })

    const clipsData = await db.query.clips.findMany({
      where: (c, { eq }) => eq(c.userId, session.user.id),
      orderBy: [desc(clips.createdAt)]
    })

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.user.id),
      columns: {
        credits: true,
        instagramAccountId: true,
        instagramAccessToken: true,
        geminiApiKey: true,
      }
    })

    return NextResponse.json({
      files,
      clips: clipsData,
      credits: userRecord?.credits ?? 0,
      userSettings: {
        instagramAccountId: userRecord?.instagramAccountId,
        instagramAccessToken: userRecord?.instagramAccessToken,
        geminiApiKey: userRecord?.geminiApiKey,
      }
    })
  } catch (error: any) {
    console.error("Get auto-video data error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
