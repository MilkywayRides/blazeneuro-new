import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notification } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    const { title, message, type, link } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message required' }, { status: 400 });
    }

    const notificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: null,
      title,
      description: link ? `${message}|${link}` : message,
      type: type || 'info',
      read: false,
    };

    await db.insert(notification).values(notificationData);

    return NextResponse.json({ 
      success: true, 
      notification: notificationData,
      message: 'Notification pushed successfully' 
    });
  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json({ error: 'Failed to push notification' }, { status: 500 });
  }
}
