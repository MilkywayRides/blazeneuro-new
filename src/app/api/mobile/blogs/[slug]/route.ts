import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { blog, user, blogFeedback } from "@/lib/schema"
import { sql } from "drizzle-orm"

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const blogPost = await db
      .select({
        blog: blog,
        author: user
      })
      .from(blog)
      .leftJoin(user, sql`${blog.authorId} = ${user.id}`)
      .where(sql`${blog.slug} = ${slug}`)
      .limit(1)

    if (!blogPost.length) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const feedbackData = await db
      .select({
        likes: sql<number>`COUNT(CASE WHEN ${blogFeedback.liked} = true THEN 1 END)`,
        dislikes: sql<number>`COUNT(CASE WHEN ${blogFeedback.liked} = false THEN 1 END)`
      })
      .from(blogFeedback)
      .where(sql`${blogFeedback.blogId} = ${blogPost[0].blog.id}`)

    const response = NextResponse.json({ 
      blog: blogPost[0].blog,
      author: blogPost[0].author ? {
        name: blogPost[0].author.name,
        image: blogPost[0].author.image
      } : null,
      feedback: {
        likes: feedbackData[0]?.likes || 0,
        dislikes: feedbackData[0]?.dislikes || 0
      }
    })
    
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    return response
  } catch (error) {
    console.error("Blog detail API error:", error)
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
  }
}
