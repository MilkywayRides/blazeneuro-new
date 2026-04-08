import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users - Admin",
};

import { requireAdmin } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function UsersPage() {
  const session = await requireAdmin();

  const users = await db.select().from(user).orderBy(user.createdAt);

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
              <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage all registered users</p>
            </div>
            <Badge variant="secondary" className="text-xs md:text-sm">{users.length} Total</Badge>
          </div>

          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Verified</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.image || ""} alt={u.name} />
                          <AvatarFallback>{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{u.name}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.role === "admin" || u.role === "superAdmin"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {u.emailVerified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
