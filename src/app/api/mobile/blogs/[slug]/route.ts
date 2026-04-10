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
      .select()
      .from(blog)
      .where(sql`${blog.slug} = ${slug}`)
      .limit(1)

    if (!blogPost.length) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const blogData = blogPost[0]
    
    // Get author
    const authorData = await db
      .select()
      .from(user)
      .where(sql`${user.id} = ${blogData.authorId}`)
      .limit(1)

    // Get feedback counts
    const feedbackData = await db
      .select({
        liked: blogFeedback.liked
      })
      .from(blogFeedback)
      .where(sql`${blogFeedback.blogId} = ${blogData.id}`)

    const likes = feedbackData.filter(f => f.liked === true).length
    const dislikes = feedbackData.filter(f => f.liked === false).length

    const response = NextResponse.json({ 
      blog: blogData,
      author: authorData.length > 0 ? {
        name: authorData[0].name,
        image: authorData[0].image
      } : null,
      feedback: {
        likes: likes,
        dislikes: dislikes
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
