"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { ResetPasswordButton } from "@/components/reset-password-button";
import { StorageChart } from "@/components/storage-chart";
import { DatabaseTables } from "@/components/database-tables";
import { CreateBranchButton } from "@/components/create-branch-button";
import { DeleteDatabaseButton } from "@/components/delete-database-button";
import { DeleteBranchButton } from "@/components/delete-branch-button";
import { RelativeTime } from "@/components/relative-time";
import { GitBranch } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function DatabaseTabsClient({ 
  defaultTab, 
  currentDb, 
  branches 
}: { 
  defaultTab: string;
  currentDb: any;
  branches: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`?${params.toString()}`);
  }

  return (
    <Tabs value={defaultTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tables">Tables</TabsTrigger>
        <TabsTrigger value="branches">Branches ({branches.length})</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
            <CardDescription>Use these credentials to connect to your database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Connection String</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded overflow-x-auto">
                  {currentDb.connectionString}
                </code>
                <CopyButton text={currentDb.connectionString} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Username</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded">{currentDb.username}</code>
                  <CopyButton text={currentDb.username} />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded">{currentDb.password}</code>
                  <CopyButton text={currentDb.password} />
                  <ResetPasswordButton databaseId={currentDb.id} currentPassword={currentDb.password} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant={currentDb.status === "active" ? "default" : "secondary"} className="mt-1">
                  {currentDb.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Max Connections</Label>
                <p className="text-sm mt-1">{currentDb.maxConnections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <StorageChart databaseId={currentDb.id} initialStorage={currentDb.storageUsed || "0"} />
      </TabsContent>

      <TabsContent value="tables" className="space-y-4">
        <DatabaseTables databaseId={currentDb.id} />
      </TabsContent>

      <TabsContent value="branches" className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Create branches for development and testing</p>
          <CreateBranchButton databaseId={currentDb.id} />
        </div>

        {branches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No branches yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {branches.map((branch) => (
              <Card key={branch.id}>
                <CardContent className="py-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{branch.name}</span>
                        {branch.isDefault && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          <RelativeTime date={branch.createdAt} />
                        </p>
                        <DeleteBranchButton databaseId={currentDb.id} branchId={branch.id} branchName={branch.name} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Connection String</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-xs bg-muted px-2 py-1 rounded overflow-x-auto">
                          {branch.connectionString}
                        </code>
                        <CopyButton text={branch.connectionString} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteDatabaseButton databaseId={currentDb.id} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
