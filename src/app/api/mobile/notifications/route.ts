import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notification } from '@/lib/schema';
import { desc, isNull, eq } from 'drizzle-orm';

const MOBILE_API_KEY = process.env.MOBILE_API_KEY || 'blazeneuro_mobile_2026';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey') || request.headers.get('x-api-key');
    
    if (apiKey !== MOBILE_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await db
      .select()
      .from(notification)
      .where(isNull(notification.userId))
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
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey !== MOBILE_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
