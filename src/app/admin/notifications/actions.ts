"use server";

import { db } from "@/lib/db";
import { notification } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNotifications(userId?: string) {
  try {
    const notifications = await db
      .select()
      .from(notification)
      .where(userId ? eq(notification.userId, userId) : undefined)
      .orderBy(desc(notification.createdAt))
      .limit(10);
    
    return notifications;
  } catch (error) {
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await db
      .update(notification)
      .set({ read: true })
      .where(eq(notification.id, notificationId));
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(userId?: string) {
  try {
    await db
      .update(notification)
      .set({ read: true })
      .where(userId ? eq(notification.userId, userId) : undefined);
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function createNotification(data: {
  userId?: string;
  title: string;
  description?: string;
  type: string;
}) {
  try {
    await db.insert(notification).values({
      id: crypto.randomUUID(),
      userId: data.userId || null,
      title: data.title,
      description: data.description || null,
      type: data.type,
      read: false,
    });
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
