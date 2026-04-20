import { requireAuth } from "@/lib/auth-check";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createUserOAuthApp } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewOAuthAppPage() {
  await requireAuth();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" isAdmin={false} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-2xl">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">New OAuth Application</h1>
              <p className="text-muted-foreground">Register a new OAuth application</p>
            </div>
          </div>

          <form action={createUserOAuthApp} className="space-y-6 rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="name">Application name</Label>
              <Input id="name" name="name" placeholder="My Application" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="What does your app do?" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homepageUrl">Homepage URL</Label>
              <Input id="homepageUrl" name="homepageUrl" type="url" placeholder="https://example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="callbackUrl">Authorization callback URL</Label>
              <Input id="callbackUrl" name="callbackUrl" type="url" placeholder="https://example.com/callback" required />
            </div>

            <Button type="submit">Create Application</Button>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
