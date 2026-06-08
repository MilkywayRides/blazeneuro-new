import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { clips } from "@/lib/schema"
import { eq, and } from "drizzle-orm"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clipId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clipId } = await params

    const clip = await db.query.clips.findFirst({
      where: (c, { eq, and }) => and(
        eq(c.id, clipId),
        eq(c.userId, session.user.id)
      )
    })

    if (!clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: clip.s3Key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    })

    return NextResponse.json({ success: true, url: signedUrl })
  } catch (error: any) {
    console.error("Get clip play URL error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
