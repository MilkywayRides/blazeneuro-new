"use server";

import { db } from "@/lib/db";
import { oauthToken, oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-check";

export async function authorizeOAuthApp(clientId: string, clientSecret: string) {
  const session = await requireAuth();

  const app = await db
    .select()
    .from(oauthApp)
    .where(eq(oauthApp.clientId, clientId))
    .limit(1);

  if (!app[0]) {
    return { error: "Invalid Client ID" };
  }

  if (app[0].clientSecret !== clientSecret) {
    return { error: "Invalid Client Secret" };
  }

  const existingToken = await db
    .select()
    .from(oauthToken)
    .where(eq(oauthToken.appId, app[0].id))
    .where(eq(oauthToken.userId, session.user.id))
    .limit(1);

  if (existingToken[0]) {
    return { error: "App already authorized" };
  }

  await db.insert(oauthToken).values({
    id: crypto.randomUUID(),
    accessToken: crypto.randomUUID(),
    refreshToken: crypto.randomUUID(),
    userId: session.user.id,
    appId: app[0].id,
    scope: "email name avatar",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  revalidatePath("/admin/settings/oauth");
  return { success: true };
}

export async function updateOAuthPermissions(tokenId: string, scope: string) {
  const session = await requireAuth();

  await db
    .update(oauthToken)
    .set({ scope })
    .where(eq(oauthToken.id, tokenId));

  revalidatePath("/admin/settings/oauth");
  return { success: true };
}

export async function revokeOAuthAccess(tokenId: string) {
  const session = await requireAuth();

  await db.delete(oauthToken).where(eq(oauthToken.id, tokenId));

  revalidatePath("/admin/settings/oauth");
  return { success: true };
}
