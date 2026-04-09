import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";

export class ApiAuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = "ApiAuthError";
  }
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function verifyApiRequest(request: NextRequest) {
  const headersList = await headers();
  
  // Check rate limiting
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  checkRateLimit(ip);
  
  // Verify CSRF token for state-changing operations
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const csrfToken = headersList.get("x-csrf-token");
    const sessionToken = headersList.get("cookie");
    
    if (!csrfToken || !sessionToken) {
      throw new ApiAuthError("CSRF token required", 403);
    }
  }
  
  // Get and verify session
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session?.user) {
    throw new ApiAuthError("Unauthorized", 401);
  }
  
  return session;
}

export async function verifyAdminRequest(request: NextRequest) {
  const session = await verifyApiRequest(request);
  
  // Check admin role
  const adminEmails = ['admin@blazeneuro.com', 'ankityadav7420@gmail.com'];
  const isAdmin = adminEmails.includes(session.user.email || '');
  
  if (!isAdmin && session.user.role !== "admin" && session.user.role !== "superAdmin") {
    throw new ApiAuthError("Forbidden - Admin access required", 403);
  }
  
  return session;
}

export function checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return;
  }
  
  if (record.count >= maxRequests) {
    throw new ApiAuthError("Too many requests", 429);
  }
  
  record.count++;
}

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export async function verifyApiKey(apiKey: string): Promise<boolean> {
  // In production, verify against database
  const hashedKey = hashApiKey(apiKey);
  // TODO: Check against database
  return false;
}

export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    return input.replace(/[<>]/g, "");
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === "object" && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeInput(value)])
    );
  }
  return input;
}

export function createSecureResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Content-Security-Policy": "default-src 'self'",
    },
  });
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  
  if (error instanceof ApiAuthError) {
    return createSecureResponse(
      { error: error.message },
      error.statusCode
    );
  }
  
  return createSecureResponse(
    { error: "Internal server error" },
    500
  );
}
