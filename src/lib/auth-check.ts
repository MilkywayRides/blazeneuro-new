import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.blazeneuro.com";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    const headersList = await headers()
    const pathname = headersList.get("x-pathname")
    const loginUrl = pathname 
      ? `${AUTH_URL}/login?redirectTo=${encodeURIComponent(pathname)}`
      : `${AUTH_URL}/login`;
    redirect(loginUrl);
  }

  return session;
}

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    const headersList = await headers()
    const pathname = headersList.get("x-pathname")
    const loginUrl = pathname 
      ? `${AUTH_URL}/login?redirectTo=${encodeURIComponent(pathname)}`
      : `${AUTH_URL}/login`;
    redirect(loginUrl);
  }

  const adminEmails = ['admin@blazeneuro.com', 'ankityadav7420@gmail.com'];
  const isAdminEmail = adminEmails.includes(session.user.email || '');
  
  const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  
  if (!dbUser[0]) {
    if (!isAdminEmail) {
      redirect("/");
    }
    return session;
  }
  
  if (dbUser[0].role !== "admin" && dbUser[0].role !== "superAdmin" && !isAdminEmail) {
    redirect("/");
  }

  return { ...session, user: { ...session.user, role: dbUser[0].role } };
}
