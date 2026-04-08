import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs - Admin",
};

import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { blog } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function BlogsPage() {
  const session = await requireAdmin();
  
  let blogs: any[] = [];
  try {
    blogs = await db.select().from(blog).orderBy(blog.createdAt);
    console.log("Blogs loaded with coverImage column:", blogs.length);
  } catch (error: any) {
    console.log("Failed to load blogs with coverImage:", error.message);
    // Fallback if coverImage column doesn't exist
    if (error.message?.includes('coverImage') || error.message?.includes('column')) {
      const result: any = await db.execute(sql`SELECT * FROM blog ORDER BY "createdAt"`);
      blogs = Array.isArray(result) ? result : (result.rows || []);
      console.log("Blogs loaded without coverImage column:", blogs.length);
    } else {
      throw error;
    }
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
            <div className="rounded-lg border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Slug</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{post.slug}</code>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={post.published ? "default" : "secondary"}>
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/blogs/${post.id}`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
