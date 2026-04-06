import { NextRequest, NextResponse } from "next/server";
import { updateBlogKeywords } from "@/lib/search";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;

  try {
    await updateBlogKeywords(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to generate keywords:", error);
    return NextResponse.json({ error: "Failed to generate keywords" }, { status: 500 });
  }
}
