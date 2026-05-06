"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"

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
  const [open, setOpen] = useState(true)
  const [userChanged, setUserChanged] = useState(false)

  useEffect(() => {
    // Check if user has manually changed sidebar state
    const savedState = localStorage.getItem('sidebar:state')
    if (savedState) {
      setUserChanged(true)
      setOpen(savedState === 'true')
    }
  }, [])

  useEffect(() => {
    // Only auto-collapse if user hasn't manually changed it
    if (!userChanged) {
      const isCoursePage = pathname.includes("/courses/") && pathname.split("/").length > 3
      setOpen(!isCoursePage)
    }
  }, [pathname, userChanged])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    setUserChanged(true)
    localStorage.setItem('sidebar:state', String(newOpen))
  }

  return (
    <SidebarProvider
      open={open}
      onOpenChange={handleOpenChange}
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
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
