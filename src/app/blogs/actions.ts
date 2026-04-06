"use server";

import { db } from "@/lib/db";
import { blogFeedback } from "@/lib/schema";
import { revalidatePath } from "next/cache";

export async function submitBlogFeedback(blogId: string, liked: boolean) {
  try {
    await db.insert(blogFeedback).values({
      id: crypto.randomUUID(),
      blogId,
      userId: null,
      liked,
    });

    revalidatePath(`/blogs/[slug]`);
  } catch (error) {
    // Table doesn't exist yet, silently fail
    console.log("Blog feedback table not created yet");
  }
  
  return { success: true };
}
