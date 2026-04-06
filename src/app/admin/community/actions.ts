"use server"

import { db } from "@/lib/db"
import { adminChatMessage, user } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function sendMessage(userId: string, message: string) {
  await db.insert(adminChatMessage).values({
    id: nanoid(),
    userId,
    message,
  })
}

export async function getMessages() {
  const messages = await db
    .select({
      message: adminChatMessage,
      user,
    })
    .from(adminChatMessage)
    .leftJoin(user, eq(adminChatMessage.userId, user.id))
    .orderBy(desc(adminChatMessage.createdAt))
    .limit(100)
  
  return messages.reverse()
}
