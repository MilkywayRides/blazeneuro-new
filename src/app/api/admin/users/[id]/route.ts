import { NextRequest } from "next/server";
import { verifyAdminRequest, handleApiError, createSecureResponse } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminRequest(request);
    const { id } = await params;
    const body = await request.json();
    
    const allowedRoles = ["user", "admin", "superAdmin"];
    
    if (body.role && !allowedRoles.includes(body.role)) {
      return createSecureResponse({ error: "Invalid role" }, 400);
    }
    
    await db.update(user)
      .set({ role: body.role, updatedAt: new Date() })
      .where(eq(user.id, id));
    
    return createSecureResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminRequest(request);
    const { id } = await params;
    
    await db.delete(user).where(eq(user.id, id));
    
    return createSecureResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
