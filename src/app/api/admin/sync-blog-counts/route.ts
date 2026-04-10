import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blog, blogFeedback } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get all blogs
    const blogs = await db.select({ id: blog.id }).from(blog);
    
    for (const blogItem of blogs) {
      // Count likes and dislikes for this blog
      const feedback = await db.select({
        likeCount: sql<number>`COUNT(CASE WHEN ${blogFeedback.liked} = true THEN 1 END)`,
        dislikeCount: sql<number>`COUNT(CASE WHEN ${blogFeedback.liked} = false THEN 1 END)`
      })
      .from(blogFeedback)
      .where(eq(blogFeedback.blogId, blogItem.id));
      
      if (feedback[0]) {
        // Update blog with actual counts
        await db.update(blog)
          .set({
            likeCount: Number(feedback[0].likeCount) || 0,
            dislikeCount: Number(feedback[0].dislikeCount) || 0
          })
          .where(eq(blog.id, blogItem.id));
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Synced counts for ${blogs.length} blogs` 
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed', details: error }, { status: 500 });
  }
}
