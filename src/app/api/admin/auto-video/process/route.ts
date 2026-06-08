import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { uploadedFiles } from "@/lib/schema"
import { eq } from "drizzle-orm"

async function runProcessInBackground(uploadedFileId: string, userId: string, s3Key?: string, youtubeUrl?: string) {
  try {
    // 1. Get user credits
    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, userId)
    })
    
    if (!userRecord || userRecord.credits <= 0) {
      await db.update(uploadedFiles).set({ status: 'no credits' }).where(eq(uploadedFiles.id, uploadedFileId))
      return
    }

    // 2. Set status to processing
    await db.update(uploadedFiles).set({ status: 'processing' }).where(eq(uploadedFiles.id, uploadedFileId))

    // 3. Call Modal Backend
    const modalUrl = process.env.AUTO_VIDEO_MODAL_URL
    const modalAuth = process.env.AUTO_VIDEO_MODAL_AUTH
    
    // Get user's custom credentials
    const geminiApiKey = userRecord.geminiApiKey || process.env.GEMINI_API_KEY
    const instagramAccountId = userRecord.instagramAccountId
    const instagramAccessToken = userRecord.instagramAccessToken

    if (!modalUrl) {
      console.error("AUTO_VIDEO_MODAL_URL not set")
      await db.update(uploadedFiles).set({ status: 'failed (modal url missing)' }).where(eq(uploadedFiles.id, uploadedFileId))
      return
    }

    const modalResponse = await fetch(modalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${modalAuth}`
      },
      body: JSON.stringify({ 
        s3_key: s3Key,
        youtube_url: youtubeUrl,
        gemini_api_key: geminiApiKey,
        instagram_account_id: instagramAccountId,
        instagram_access_token: instagramAccessToken
      })
    })

    if (!modalResponse.ok) {
      const errorText = await modalResponse.text()
      console.error("Modal processing error:", errorText)
      await db.update(uploadedFiles).set({ status: 'failed (modal error)' }).where(eq(uploadedFiles.id, uploadedFileId))
      return
    }

    // 4. Mark as processed (Modal now handles publishing or we'll add clip discovery later)
    await db.update(uploadedFiles).set({ status: 'processed' }).where(eq(uploadedFiles.id, uploadedFileId))

  } catch (error) {
    console.error("Background processing error:", error)
    await db.update(uploadedFiles).set({ status: 'failed' }).where(eq(uploadedFiles.id, uploadedFileId))
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { uploadedFileId, youtubeUrl } = await req.json()

    let fileId = uploadedFileId
    let s3Key: string | undefined

    if (youtubeUrl) {
      // Create a record for the YouTube URL task
      const [newFile] = await db.insert(uploadedFiles).values({
        userId: session.user.id,
        displayName: youtubeUrl,
        s3Key: `youtube/${youtubeUrl.split('v=')[1] || Date.now()}`,
        uploaded: true,
        status: 'queued'
      }).returning()
      fileId = newFile.id
    } else {
      const fileRecord = await db.query.uploadedFiles.findFirst({
        where: (f, { eq, and }) => and(
          eq(f.id, uploadedFileId),
          eq(f.userId, session.user.id)
        )
      })

      if (!fileRecord) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      s3Key = fileRecord.s3Key
      
      // Mark as uploaded
      await db.update(uploadedFiles).set({ uploaded: true }).where(eq(uploadedFiles.id, fileId))
    }

    // Run in background
    runProcessInBackground(fileId, session.user.id, s3Key, youtubeUrl)

    return NextResponse.json({ success: true, message: 'Processing started in background' })
  } catch (error) {
    console.error("Process video error:", error)
    const message = error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
