import { requireAdmin } from "@/lib/auth-check";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateDatabaseForm } from "@/components/create-database-form";

export const dynamic = 'force-dynamic';

export default async function NewDatabasePage() {
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
            <h1 className="text-2xl md:text-3xl font-bold">Create Database</h1>
            <p className="text-sm md:text-base text-muted-foreground">Create a new PostgreSQL database</p>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>Configure your new PostgreSQL database</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateDatabaseForm userId={session.user.id} />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
