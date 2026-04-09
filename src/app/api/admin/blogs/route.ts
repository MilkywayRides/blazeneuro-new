import { NextRequest } from "next/server";
import { verifyAdminRequest, handleApiError, createSecureResponse } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { blog } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    await verifyAdminRequest(request);
    
    const blogs = await db.select().from(blog);
    
    return createSecureResponse({ blogs });
  } catch (error) {
    return handleApiError(error);
  }
}
