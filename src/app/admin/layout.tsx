import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireAdmin } from "@/lib/auth-check";
import { getNotifications } from "@/app/admin/notifications/actions"
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin();
  const notifications = await getNotifications();

  const userData = {
    name: session.user.name || "Admin",
    email: session.user.email || "admin@blazeneuro.com",
    avatar: session.user.image || "/avatars/admin.jpg",
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" collapsible="icon" isAdmin={true} userData={userData} />
      <SidebarInset>
        <SiteHeader notifications={notifications} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
