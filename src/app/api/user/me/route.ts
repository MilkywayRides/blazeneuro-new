import { NextRequest } from "next/server";
import { verifyApiRequest, handleApiError, createSecureResponse } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await verifyApiRequest(request);
    
    const currentUser = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
    }).from(user).where(eq(user.id, session.user.id)).limit(1);
    
    if (!currentUser[0]) {
      return createSecureResponse({ error: "User not found" }, 404);
    }
    
    return createSecureResponse({ user: currentUser[0] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyApiRequest(request);
    const body = await request.json();
    
    const allowedFields = ["name", "image"];
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return createSecureResponse({ error: "No valid fields to update" }, 400);
    }
    
    await db.update(user)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(user.id, session.user.id));
    
    return createSecureResponse({ success: true, updates });
  } catch (error) {
    return handleApiError(error);
  }
}
