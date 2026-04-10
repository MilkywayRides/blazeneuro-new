import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pushToken } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { token, platform } = await request.json();
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!token || !platform) {
      return NextResponse.json({ error: 'Token and platform required' }, { status: 400 });
    }
    
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(pushToken)
      .values({ id: tokenId, userId, token, platform })
      .onConflictDoUpdate({
        target: pushToken.token,
        set: { userId, platform }
      });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register push token error:', error);
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }
    
    await db.delete(pushToken).where(eq(pushToken.token, token));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete push token error:', error);
    return NextResponse.json({ error: 'Failed to delete token' }, { status: 500 });
  }
}
