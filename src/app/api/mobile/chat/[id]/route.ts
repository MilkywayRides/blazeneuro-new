import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatMessage } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if message belongs to user
    const message = await db
      .select({ userId: chatMessage.userId })
      .from(chatMessage)
      .where(eq(chatMessage.id, id))
      .limit(1);
    
    if (message.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    if (message[0].userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await db.delete(chatMessage).where(eq(chatMessage.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
