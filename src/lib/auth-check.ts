import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/oauth/sign-in");
  }

  return session;
}

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/oauth/sign-in");
  }

  // Fetch user from database to get role
  const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  
  if (!dbUser[0] || (dbUser[0].role !== "admin" && dbUser[0].role !== "superAdmin")) {
    redirect("/");
  }

  return { ...session, user: { ...session.user, role: dbUser[0].role } };
}
