import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { blog } from "@/lib/schema"
import { sql } from "drizzle-orm"

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const blogPost = await db
      .select()
      .from(blog)
      .where(sql`${blog.slug} = ${slug} AND ${blog.published} = true`)
      .limit(1)

    if (!blogPost.length) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const response = NextResponse.json({ blog: blogPost[0] })
    
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    return response
  } catch (error) {
    console.error("Blog detail API error:", error)
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
  }
}
