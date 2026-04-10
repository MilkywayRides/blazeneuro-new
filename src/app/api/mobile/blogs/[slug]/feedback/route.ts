import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogFeedback, blog } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { liked } = await request.json();
    const { slug: blogId } = await params;
    
    const userIdHeader = request.headers.get('x-user-id');
    const userId = userIdHeader && userIdHeader !== 'anonymous' ? userIdHeader : null;
    const feedbackId = userId ? `${blogId}-${userId}` : `${blogId}-anon-${Date.now()}`;
    
    // Check if feedback already exists
    const existingFeedback = await db.query.blogFeedback.findFirst({
      where: eq(blogFeedback.id, feedbackId)
    });
    
    await db.insert(blogFeedback)
      .values({
        id: feedbackId,
        blogId,
        userId,
        liked
      })
      .onConflictDoUpdate({
        target: blogFeedback.id,
        set: { liked }
      });
    
    // Update blog counts
    if (existingFeedback) {
      // User changed their feedback
      if (existingFeedback.liked && !liked) {
        // Changed from like to dislike
        await db.update(blog)
          .set({ 
            likeCount: sql`${blog.likeCount} - 1`,
            dislikeCount: sql`${blog.dislikeCount} + 1`
          })
          .where(eq(blog.id, blogId));
      } else if (!existingFeedback.liked && liked) {
        // Changed from dislike to like
        await db.update(blog)
          .set({ 
            likeCount: sql`${blog.likeCount} + 1`,
            dislikeCount: sql`${blog.dislikeCount} - 1`
          })
          .where(eq(blog.id, blogId));
      }
    } else {
      // New feedback
      if (liked) {
        await db.update(blog)
          .set({ likeCount: sql`${blog.likeCount} + 1` })
          .where(eq(blog.id, blogId));
      } else {
        await db.update(blog)
          .set({ dislikeCount: sql`${blog.dislikeCount} + 1` })
          .where(eq(blog.id, blogId));
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
