import { db } from "./db";
import { blog } from "./schema";
import { or, ilike } from "drizzle-orm";

// Simple search without AI
export async function searchBlogs(query: string): Promise<any[]> {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];

  // Direct search in title, content, excerpt
  const results = await db.select()
    .from(blog)
    .where(
      or(
        ilike(blog.title, `%${normalizedQuery}%`),
        ilike(blog.content, `%${normalizedQuery}%`),
        ilike(blog.excerpt, `%${normalizedQuery}%`)
      )
    )
    .limit(20);

  return results;
}

// Stub function - no longer generates keywords
export async function updateBlogKeywords(blogId: string) {
  // No-op: AI keyword generation disabled
  return;
}

// Stub function - no longer generates keywords
export async function generateAllBlogKeywords() {
  // No-op: AI keyword generation disabled
  return;
}
