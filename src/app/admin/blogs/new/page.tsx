import { requireAdmin } from "@/lib/auth-check";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BlogForm } from "@/components/blog-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewBlogPage() {
  const session = await requireAdmin();

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
            <h1 className="text-2xl md:text-3xl font-bold">Create Blog Post</h1>
            <p className="text-sm md:text-base text-muted-foreground">Write a new blog post</p>
          </div>

          <BlogForm />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
