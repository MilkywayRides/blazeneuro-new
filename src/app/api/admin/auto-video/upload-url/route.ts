import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { uploadedFiles } from "@/lib/schema"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename, contentType } = await req.json()

    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    const fileExtension = filename.split(".").pop() ?? "mp4"
    const uniqueId = uuidv4()
    const key = `auto-video/${session.user.id}/${uniqueId}/original.${fileExtension}`

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 })

    const [fileRecord] = await db.insert(uploadedFiles).values({
      userId: session.user.id,
      s3Key: key,
      displayName: filename,
      uploaded: false,
    }).returning()

    return NextResponse.json({
      success: true,
      signedUrl,
      key,
      uploadedFileId: fileRecord.id,
    })
  } catch (error: any) {
    console.error("Generate upload URL error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
