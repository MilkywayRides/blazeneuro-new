import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notification } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const notifications = await db
      .select()
      .from(notification)
      .where(userId ? eq(notification.userId, userId) : eq(notification.userId, null))
      .orderBy(desc(notification.createdAt))
      .limit(50);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { notificationId } = await request.json();

    await db
      .update(notification)
      .set({ read: true })
      .where(eq(notification.id, notificationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
