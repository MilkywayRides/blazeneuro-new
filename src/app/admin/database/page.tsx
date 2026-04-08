import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database - Admin",
};

import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { database } from "@/lib/schema";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Database as DatabaseIcon } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function DatabasesPage() {
  const session = await requireAdmin();
  const userDatabases = await db.select().from(database).where(eq(database.userId, session.user.id));

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
              <h1 className="text-2xl md:text-3xl font-bold">Databases</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage your PostgreSQL databases</p>
            </div>
            <Link href="/admin/database/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Database
              </Button>
            </Link>
          </div>

          {userDatabases.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No databases yet</CardTitle>
                <CardDescription>
                  Create your first PostgreSQL database to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/database/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Database
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userDatabases.map((db) => (
                <Card key={db.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <DatabaseIcon className="h-5 w-5 text-muted-foreground" />
                      <Badge variant={db.status === "active" ? "default" : "secondary"}>
                        {db.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{db.name}</CardTitle>
                    <CardDescription>{db.region}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <p>Storage: {db.storageUsed} MB</p>
                      <p>Max Connections: {db.maxConnections}</p>
                    </div>
                    <Link href={`/admin/database/${db.id}`}>
                      <Button variant="outline" className="w-full">
                        Manage
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
