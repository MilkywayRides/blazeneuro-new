"use server";

import { db } from "@/lib/db";
import { blog } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-check";
import { createNotification } from "@/app/admin/notifications/actions";
import { updateBlogKeywords } from "@/lib/search";

export async function createBlog(data: {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
}) {
  const session = await requireAdmin();
  const newId = crypto.randomUUID();

  try {
    await db.insert(blog).values({
      id: newId,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || null,
      coverImage: data.coverImage || null,
      published: data.published,
      authorId: session.user.id,
    });
    console.log("Blog created with coverImage column");
  } catch (error: any) {
    console.log("First insert failed:", error.message);
    // Fallback if coverImage column doesn't exist
    if (error.message?.includes('coverImage') || error.message?.includes('column')) {
      try {
        await db.execute(sql`
          INSERT INTO blog (id, title, slug, content, excerpt, published, "authorId", "createdAt", "updatedAt")
          VALUES (${newId}, ${data.title}, ${data.slug}, ${data.content}, ${data.excerpt || null}, ${data.published}, ${session.user.id}, NOW(), NOW())
        `);
        console.log("Blog created without coverImage column");
      } catch (fallbackError: any) {
        console.error("Fallback insert also failed:", fallbackError.message);
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }

  // Auto-generate AI keywords
  updateBlogKeywords(newId).catch(err => console.error("Keyword generation failed:", err));

  // Create notification
  await createNotification({
    title: "New blog post created",
    description: `"${data.title}" has been ${data.published ? "published" : "saved as draft"}`,
    type: "blog",
  });

  revalidatePath("/admin/blogs");
  revalidatePath("/blogs");
  return { success: true };
}

export async function updateBlog(
  id: string,
  data: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage: string;
    published: boolean;
  }
) {
  await requireAdmin();

  try {
    await db
      .update(blog)
      .set({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        published: data.published,
        updatedAt: new Date(),
      })
      .where(eq(blog.id, id));
  } catch (error) {
    // Fallback if coverImage column doesn't exist
    await db.execute(sql`
      UPDATE blog 
      SET title = ${data.title}, slug = ${data.slug}, content = ${data.content}, 
          excerpt = ${data.excerpt || null}, published = ${data.published}, "updatedAt" = NOW()
      WHERE id = ${id}
    `);
  }

  // Auto-regenerate AI keywords
  updateBlogKeywords(id).catch(err => console.error("Keyword generation failed:", err));

  revalidatePath("/admin/blogs");
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${data.slug}`);
  return { success: true };
}

export async function deleteBlog(id: string) {
  await requireAdmin();

  await db.delete(blog).where(eq(blog.id, id));

  revalidatePath("/admin/blogs");
  revalidatePath("/blogs");
  return { success: true };
}
