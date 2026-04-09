import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.blazeneuro.com";

async function getSession() {
  const headersList = await headers();
  const cookie = headersList.get("cookie");
  
  if (!cookie) {
    console.log("[Auth] No cookie found");
    return null;
  }
  
  try {
    const response = await fetch(`${AUTH_URL}/api/auth/session`, {
      headers: { 
        cookie,
        "Content-Type": "application/json"
      },
      cache: "no-store",
    });
    
    console.log("[Auth] Session response status:", response.status);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    console.log("[Auth] Session data:", data);
    
    return data.session || data.user ? data : null;
  } catch (error) {
    console.error("[Auth] Session fetch error:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/";
    const redirectUrl = `https://blazeneuro.com${pathname}`;
    const loginUrl = `${AUTH_URL}/login?redirectTo=${encodeURIComponent(redirectUrl)}`;
    console.log("[Auth] Redirecting to login:", loginUrl);
    redirect(loginUrl);
  }

  return session;
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session?.user?.id) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/";
    const redirectUrl = `https://blazeneuro.com${pathname}`;
    const loginUrl = `${AUTH_URL}/login?redirectTo=${encodeURIComponent(redirectUrl)}`;
    console.log("[Auth] No session, redirecting to login:", loginUrl);
    redirect(loginUrl);
  }

  console.log("[Auth] User found:", session.user.email);

  const adminEmails = ['admin@blazeneuro.com', 'ankityadav7420@gmail.com'];
  const isAdminEmail = adminEmails.includes(session.user.email || '');
  
  const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  
  if (!dbUser[0]) {
    console.log("[Auth] User not in DB, checking admin email");
    if (!isAdminEmail) {
      console.log("[Auth] Not admin email, redirecting home");
      redirect("/");
    }
    return session;
  }
  
  console.log("[Auth] User role:", dbUser[0].role);
  
  if (dbUser[0].role !== "admin" && dbUser[0].role !== "superAdmin" && !isAdminEmail) {
    console.log("[Auth] Not admin, redirecting home");
    redirect("/");
  }

  return { ...session, user: { ...session.user, role: dbUser[0].role } };
}
