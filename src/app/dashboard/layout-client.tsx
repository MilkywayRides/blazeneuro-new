"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import { usePathname } from "next/navigation"
import React from "react"

export function DashboardLayoutClient({ 
  userData, 
  userId, 
  userName, 
  userEmail 
}: { 
  userData: any
  userId: string
  userName: string | null
  userEmail: string
}) {
  const pathname = usePathname()
  const isCoursePage = pathname.includes("/courses/") && pathname.split("/").length > 3
  const defaultOpen = !isCoursePage

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AnalyticsTracker 
        userId={userId} 
        name={userName} 
        email={userEmail} 
      />
      <AppSidebar variant="inset" isAdmin={false} userData={userData} />
      <SidebarInset>
        <SiteHeader />
      </SidebarInset>
    </SidebarProvider>
  )
}
