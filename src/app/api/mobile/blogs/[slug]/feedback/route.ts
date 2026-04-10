import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogFeedback } from '@/lib/schema';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { liked } = await request.json();
    const { slug: blogId } = await params;
    
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    await db.insert(blogFeedback)
      .values({
        id: `${blogId}-${userId}`,
        blogId,
        userId,
        liked
      })
      .onConflictDoUpdate({
        target: blogFeedback.id,
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
