import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogFeedback } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { liked } = await request.json();
    const blogId = params.slug;
    
    // Get user session (you'll need to implement this based on your auth)
    // For now, we'll use a placeholder
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    // Upsert feedback
    await db.insert(blogFeedback)
      .values({
        blogId,
        userId,
        liked
      })
      .onConflictDoUpdate({
        target: [blogFeedback.blogId, blogFeedback.userId],
        set: { liked }
      });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
