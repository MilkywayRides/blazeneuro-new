import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatMessage, chatMention, user, pushToken } from '@/lib/schema';
import { desc, eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Get messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');
    
    let query = db
      .select({
        id: chatMessage.id,
        content: chatMessage.content,
        imageUrl: chatMessage.imageUrl,
        replyToId: chatMessage.replyToId,
        createdAt: chatMessage.createdAt,
        userId: chatMessage.userId,
        userName: user.name,
        userImage: user.image
      })
      .from(chatMessage)
      .leftJoin(user, eq(chatMessage.userId, user.id))
      .orderBy(desc(chatMessage.createdAt))
      .limit(limit);
    
    if (before) {
      query = query.where(sql`${chatMessage.createdAt} < ${before}`);
    }
    
    const messages = await query;
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Post message
export async function POST(request: NextRequest) {
  try {
    const { content, imageUrl, replyToId, mentions } = await request.json();
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!content?.trim() && !imageUrl) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert message
    await db.insert(chatMessage).values({
      id: messageId,
      userId,
      content: content?.trim() || '',
      imageUrl,
      replyToId
    });
    
    // Insert mentions
    if (mentions && mentions.length > 0) {
      await db.insert(chatMention).values(
        mentions.map((mentionedUserId: string) => ({
          id: `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          messageId,
          userId: mentionedUserId
        }))
      );
      
      // Send push notifications
      await sendMentionNotifications(messageId, userId, mentions);
    }
    
    // Send reply notification
    if (replyToId) {
      const originalMessage = await db
        .select({ userId: chatMessage.userId })
        .from(chatMessage)
        .where(eq(chatMessage.id, replyToId))
        .limit(1);
      
      if (originalMessage.length > 0 && originalMessage[0].userId !== userId) {
        await sendReplyNotification(messageId, userId, originalMessage[0].userId);
      }
    }
    
    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    console.error('Post message error:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}

async function sendMentionNotifications(messageId: string, senderId: string, mentionedUserIds: string[]) {
  try {
    const sender = await db.select({ name: user.name }).from(user).where(eq(user.id, senderId)).limit(1);
    const senderName = sender[0]?.name || 'Someone';
    
    const tokens = await db
      .select({ token: pushToken.token, platform: pushToken.platform })
      .from(pushToken)
      .where(sql`${pushToken.userId} IN ${mentionedUserIds}`);
    
    // TODO: Implement actual push notification sending (FCM/APNS)
    console.log('Send mention notifications:', { messageId, senderName, tokens });
  } catch (error) {
    console.error('Send mention notifications error:', error);
  }
}

async function sendReplyNotification(messageId: string, senderId: string, recipientId: string) {
  try {
    const sender = await db.select({ name: user.name }).from(user).where(eq(user.id, senderId)).limit(1);
    const senderName = sender[0]?.name || 'Someone';
    
    const tokens = await db
      .select({ token: pushToken.token, platform: pushToken.platform })
      .from(pushToken)
      .where(eq(pushToken.userId, recipientId));
    
    // TODO: Implement actual push notification sending (FCM/APNS)
    console.log('Send reply notification:', { messageId, senderName, tokens });
  } catch (error) {
    console.error('Send reply notification error:', error);
  }
}
