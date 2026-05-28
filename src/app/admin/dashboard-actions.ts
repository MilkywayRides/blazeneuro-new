"use server";

import { db } from "@/lib/db";
import { adminDashboardLayout } from "@/lib/schema";
import { requireAdmin } from "@/lib/auth-check";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveDashboardLayout(config: unknown) {
  const session = await requireAdmin();
  const userId = session.user.id;

  const existing = await db
    .select()
    .from(adminDashboardLayout)
    .where(eq(adminDashboardLayout.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(adminDashboardLayout)
      .set({
        config: config as any,
        updatedAt: new Date(),
      })
      .where(eq(adminDashboardLayout.userId, userId));
  } else {
    await db.insert(adminDashboardLayout).values({
      id: crypto.randomUUID(),
      userId,
      config: config as any,
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function getDashboardLayout(userId: string) {
  try {
    const result = await db
      .select()
      .from(adminDashboardLayout)
      .where(eq(adminDashboardLayout.userId, userId))
      .limit(1);

    return result.length > 0 ? (result[0].config as any) : null;
  } catch (error) {
    console.error("Failed to fetch dashboard layout:", error);
    return null; // Return null if table doesn't exist or other error
  }
}
