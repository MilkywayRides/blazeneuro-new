import { NextRequest, NextResponse } from "next/server";
import { updateBlogKeywords } from "@/lib/search";

export async function POST(req: NextRequest) {
  try {
    const { blogId } = await req.json();
    
    if (!blogId) {
      return NextResponse.json({ error: "blogId required" }, { status: 400 });
    }

    await updateBlogKeywords(blogId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auto-generate keywords error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
