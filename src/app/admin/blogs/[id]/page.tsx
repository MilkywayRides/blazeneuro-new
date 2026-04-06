import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { blog } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BlogForm } from "@/components/blog-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;

  let post: any[] = [];
  try {
    post = await db.select().from(blog).where(eq(blog.id, id)).limit(1);
  } catch (error: any) {
    // Fallback if coverImage column doesn't exist
    if (error.message?.includes('coverImage')) {
      const result: any = await db.execute(sql`SELECT * FROM blog WHERE id = ${id} LIMIT 1`);
      post = Array.isArray(result) ? result : (result.rows || []);
    } else {
      throw error;
    }
  }

  if (!post[0]) {
    notFound();
  }

  const userData = {
    name: session.user.name || "Admin",
    email: session.user.email || "admin@blazeneuro.com",
    avatar: session.user.image || "/avatars/admin.jpg",
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" userData={userData} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div>
            <Link href="/admin/blogs">
              <Button variant="ghost" size="sm" className="mb-4">
                <ChevronLeft className="h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Edit Blog Post</h1>
            <p className="text-sm md:text-base text-muted-foreground">Update your blog post</p>
          </div>

          <BlogForm blog={post[0]} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
