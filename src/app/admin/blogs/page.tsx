import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { blog } from "@/lib/schema";
import { desc, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BlogList } from "./blog-list";

export const metadata: Metadata = {
  title: "Blogs - Admin",
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default async function BlogsPage() {
  await requireAdmin();
  
  let blogs: BlogPost[] = [];
  try {
    const data = await db.select().from(blog).orderBy(desc(blog.createdAt));
    blogs = data as unknown as BlogPost[];
    console.log("Blogs loaded:", blogs.length);
  } catch (error: any) {
    console.log("Failed to load blogs:", error.message);
    // Fallback if there are schema mismatches
    const result: any = await db.execute(sql`SELECT * FROM blog ORDER BY "createdAt" DESC`);
    blogs = (Array.isArray(result) ? result : (result.rows || [])) as BlogPost[];
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Blogs</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage blog posts</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Blog
          </Button>
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 md:p-12 text-center">
          <h3 className="text-base md:text-lg font-semibold mb-2">No blogs yet</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-4">Create your first blog post</p>
          <Link href="/admin/blogs/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Blog
            </Button>
          </Link>
        </div>
      ) : (
        <BlogList initialBlogs={blogs} />
      )}
    </div>
  );
}
