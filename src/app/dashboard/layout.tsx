import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireAuth } from "@/lib/auth-check";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth();

  const userData = {
    name: session.user.name || "User",
    email: session.user.email || "",
    avatar: session.user.image || "/avatars/default.jpg",
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
      <AnalyticsTracker 
        userId={session.user.id} 
        name={session.user.name} 
        email={session.user.email} 
      />
      <AppSidebar variant="inset" isAdmin={false} userData={userData} />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
