import { NextRequest } from "next/server";
import { verifyApiRequest, handleApiError, createSecureResponse } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await verifyApiRequest(request);
    
    const currentUser = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });
    
    if (!currentUser) {
      return createSecureResponse({ error: "User not found" }, 404);
    }
    
    return createSecureResponse({ user: currentUser });
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
      .where((users, { eq }) => eq(users.id, session.user.id));
    
    return createSecureResponse({ success: true, updates });
  } catch (error) {
    return handleApiError(error);
  }
}
