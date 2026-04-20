"use server";

import { requireAuth } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export async function createUserOAuthApp(formData: FormData) {
  const session = await requireAuth();
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const homepageUrl = formData.get("homepageUrl") as string;
  const callbackUrl = formData.get("callbackUrl") as string;

  const clientId = randomBytes(16).toString("hex");
  const clientSecret = randomBytes(32).toString("hex");

  await db.insert(oauthApp).values({
    id: randomBytes(16).toString("hex"),
    name,
    description,
    homepageUrl,
    callbackUrl,
    clientId,
    clientSecret,
    userId: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/dashboard/oauth");
}
