import { NextRequest } from "next/server";
import { verifyAdminRequest, handleApiError, createSecureResponse } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    await verifyAdminRequest(request);
    
    const apps = await db.select({
      id: oauthApp.id,
      name: oauthApp.name,
      clientId: oauthApp.clientId,
      homepageUrl: oauthApp.homepageUrl,
      description: oauthApp.description,
      callbackUrl: oauthApp.callbackUrl,
      userId: oauthApp.userId,
      archived: oauthApp.archived,
      createdAt: oauthApp.createdAt,
    }).from(oauthApp);
    
    return createSecureResponse({ apps });
  } catch (error) {
    return handleApiError(error);
  }
}
