"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateAutoVideoSettings(data: {
  instagramAccountId?: string;
  instagramAccessToken?: string;
  geminiApiKey?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .update(user)
      .set({
        instagramAccountId: data.instagramAccountId,
        instagramAccessToken: data.instagramAccessToken,
        geminiApiKey: data.geminiApiKey,
      })
      .where(eq(user.id, session.user.id));

    revalidatePath("/admin/auto-video");
    return { success: true };
  } catch (error: any) {
    console.error("Update settings error:", error);
    return { success: false, error: error.message };
  }
}
