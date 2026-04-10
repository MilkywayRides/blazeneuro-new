import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { blogs } from "@/lib/schema"
import { eq } from "drizzle-orm"

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const blog = await db
      .select()
      .from(blogs)
      .where(eq(blogs.slug, params.slug))
      .limit(1)

    if (!blog.length) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const response = NextResponse.json({ blog: blog[0] })
    
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    return response
  } catch (error) {
    console.error("Blog detail API error:", error)
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
  }
}
