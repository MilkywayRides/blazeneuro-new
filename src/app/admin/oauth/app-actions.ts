"use server"

import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function archiveOAuthApp(appId: string) {
  await requireAdmin();
  
  await db.update(oauthApp)
    .set({ archived: true, updatedAt: new Date() })
    .where(eq(oauthApp.id, appId));
  
  revalidatePath("/admin/oauth");
}

export async function unarchiveOAuthApp(appId: string) {
  await requireAdmin();
  
  await db.update(oauthApp)
    .set({ archived: false, updatedAt: new Date() })
    .where(eq(oauthApp.id, appId));
  
  revalidatePath("/admin/oauth");
}

export async function deleteOAuthApp(appId: string) {
  await requireAdmin();
  
  await db.delete(oauthApp).where(eq(oauthApp.id, appId));
  
  revalidatePath("/admin/oauth");
}
