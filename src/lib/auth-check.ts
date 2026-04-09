import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.blazeneuro.com";
const ADMIN_EMAILS = ['admin@blazeneuro.com', 'ankityadav7420@gmail.com'];

async function getSession() {
  const headersList = await headers();
  const cookie = headersList.get("cookie");
  
  if (!cookie) {
    console.log("[Auth] No cookie found");
    return null;
  }
  
  try {
    // Use local API endpoint to avoid CORS issues
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://blazeneuro.com";
    const response = await fetch(`${baseUrl}/api/session`, {
      headers: { 
        cookie,
        "Content-Type": "application/json"
      },
      cache: "no-store",
    });
    
    console.log("[Auth] Session response status:", response.status);
    
    if (!response.ok) {
      console.log("[Auth] Session response not OK");
      return null;
    }
    
    const data = await response.json();
    console.log("[Auth] Session data received:", { 
      hasUser: !!data?.user, 
      userId: data?.user?.id,
      email: data?.user?.email 
    });
    
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
  console.log("[Auth] requireAdmin called");
  const session = await getSession();

  // Check if user is logged in
  if (!session?.user?.id) {
    console.log("[Auth] No session found, redirecting to login");
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/admin";
    const redirectUrl = `https://blazeneuro.com${pathname}`;
    const loginUrl = `${AUTH_URL}/login?redirectTo=${encodeURIComponent(redirectUrl)}`;
    redirect(loginUrl);
  }

  const userEmail = session.user.email || '';
  console.log("[Auth] User logged in:", userEmail);

  // Check if user has admin email
  const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
  console.log("[Auth] Is admin email:", isAdminEmail);
  
  if (isAdminEmail) {
    console.log("[Auth] Admin email detected, granting access");
    return { ...session, user: { ...session.user, role: 'admin' } };
  }
  
  // Check database for user role
  try {
    const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
    
    if (!dbUser || dbUser.length === 0) {
      console.log("[Auth] User not found in database");
      throw new Error("Unauthorized: Admin access required");
    }
    
    const userRole = dbUser[0].role;
    console.log("[Auth] User role from DB:", userRole);
    
    if (userRole !== "admin" && userRole !== "superAdmin") {
      console.log("[Auth] User does not have admin role");
      throw new Error("Unauthorized: Admin access required");
    }

    console.log("[Auth] Admin access granted");
    return { ...session, user: { ...session.user, role: userRole } };
  } catch (error) {
    console.error("[Auth] Database check error:", error);
    throw error;
  }
}
