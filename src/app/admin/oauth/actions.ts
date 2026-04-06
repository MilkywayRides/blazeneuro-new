"use server"

import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

export async function createOAuthApp(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const homepageUrl = formData.get("homepageUrl") as string;
  const description = formData.get("description") as string;
  const callbackUrl = formData.get("callbackUrl") as string;

  const clientId = `bn_${randomBytes(16).toString("hex")}`;
  const clientSecret = randomBytes(32).toString("hex");

  const session = await requireAdmin();

  await db.insert(oauthApp).values({
    id: randomBytes(16).toString("hex"),
    name,
    clientId,
    clientSecret,
    homepageUrl,
    description: description || null,
    callbackUrl,
    userId: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  redirect("/admin/oauth");
}
