import { db } from "@/lib/db";
import { blog, user } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import BlogsPageClient from "./blogs-client";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function BlogsPage() {
  let blogs: any[] = [];
  
  try {
    blogs = await db
      .select({
        blog,
        author: user,
      })
      .from(blog)
      .leftJoin(user, eq(blog.authorId, user.id))
      .where(eq(blog.published, true))
      .orderBy(desc(blog.createdAt));
  } catch (error: any) {
    if (error.message?.includes('coverImage')) {
      const result: any = await db.execute(sql`
        SELECT b.*, u.id as author_id, u.name as author_name, u.email as author_email, 
               u.image as author_image, u.role as author_role
        FROM blog b
        LEFT JOIN "user" u ON b."authorId" = u.id
        WHERE b.published = true
        ORDER BY b."createdAt" DESC
      `);
      const rows = Array.isArray(result) ? result : (result.rows || []);
      blogs = rows.map((r: any) => ({
        blog: {
          id: r.id,
          title: r.title,
          slug: r.slug,
          content: r.content,
          excerpt: r.excerpt,
          coverImage: r.coverImage,
          published: r.published,
          authorId: r.authorId,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        },
        author: r.author_id ? {
          id: r.author_id,
          name: r.author_name,
          email: r.author_email,
          image: r.author_image,
          role: r.author_role,
        } : null,
      }));
    }
  }
  
  return <BlogsPageClient blogs={blogs} />;
}
