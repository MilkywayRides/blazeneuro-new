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
  userEmail,
  children
}: { 
  userData: any
  userId: string
  userName: string | null
  userEmail: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isCoursePage = pathname.includes("/courses/") && pathname.split("/").length > 3
  const defaultOpen = !isCoursePage

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4rem",
        } as React.CSSProperties
      }
    >
      <AnalyticsTracker 
        userId={userId} 
        name={userName} 
        email={userEmail} 
      />
      <AppSidebar variant="inset" collapsible="icon" isAdmin={false} userData={userData} />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
