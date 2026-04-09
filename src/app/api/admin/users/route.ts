import { NextRequest } from "next/server";
import { verifyAdminRequest, handleApiError, createSecureResponse } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    await verifyAdminRequest(request);
    
    const users = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
    }).from(user);
    
    return createSecureResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
