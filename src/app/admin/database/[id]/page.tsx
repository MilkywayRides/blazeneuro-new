import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { database, databaseBranch } from "@/lib/schema";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatabaseTabsClient } from "@/components/database-tabs-client";
import { CopyButton } from "@/components/copy-button";
import { DeleteDatabaseButton } from "@/components/delete-database-button";
import { CreateBranchButton } from "@/components/create-branch-button";
import { StorageChart } from "@/components/storage-chart";
import { ResetPasswordButton } from "@/components/reset-password-button";
import { DatabaseTables } from "@/components/database-tables";
import { RelativeTime } from "@/components/relative-time";
import { GitBranch, Database as DatabaseIcon } from "lucide-react";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DatabaseDetailPage(props: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireAdmin();
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  if (!params?.id) {
    notFound();
  }
  
  const dbRecord = await db.select().from(database).where(eq(database.id, params.id)).limit(1);
  
  if (dbRecord.length === 0 || dbRecord[0].userId !== session.user.id) {
    notFound();
  }

  const branches = await db.select().from(databaseBranch).where(eq(databaseBranch.databaseId, params.id));

  const userData = {
    name: session.user.name || "Admin",
    email: session.user.email || "admin@blazeneuro.com",
    avatar: session.user.image || "/avatars/admin.jpg",
  };

  const currentDb = dbRecord[0];
  const defaultTab = searchParams.tab || "overview";

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
              <h1 className="text-2xl md:text-3xl font-bold">{currentDb.name}</h1>
              <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4" />
                {currentDb.region} · {currentDb.schemaName}
              </p>
            </div>
            <DeleteDatabaseButton databaseId={currentDb.id} />
          </div>

          <DatabaseTabsClient 
            defaultTab={defaultTab}
            currentDb={currentDb}
            branches={branches}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
