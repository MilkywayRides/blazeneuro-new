import { requireAdmin } from "@/lib/auth-check";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOAuthApp } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewOAuthAppPage() {
  await requireAdmin();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-2xl">
          <div className="flex items-center gap-4">
            <Link href="/admin/oauth">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">New OAuth Application</h1>
              <p className="text-muted-foreground">Register a new OAuth application</p>
            </div>
          </div>

          <form action={createOAuthApp} className="space-y-6 rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="name">Application name</Label>
              <Input
                id="name"
                name="name"
                placeholder="My Application"
                required
              />
              <p className="text-sm text-muted-foreground">
                Something users will recognize and trust.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="homepageUrl">Homepage URL</Label>
              <Input
                id="homepageUrl"
                name="homepageUrl"
                type="url"
                placeholder="http://localhost:3000"
                required
              />
              <p className="text-sm text-muted-foreground">
                The full URL to your application homepage.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Application description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Application description is optional"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                This is displayed to all users of your application.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="callbackUrl">Authorization callback URL</Label>
              <Input
                id="callbackUrl"
                name="callbackUrl"
                type="url"
                placeholder="http://localhost:3000/api/auth/callback"
                required
              />
              <p className="text-sm text-muted-foreground">
                Your application's callback URL. Read our OAuth documentation for more information.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Create OAuth App</Button>
              <Link href="/admin/oauth">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
