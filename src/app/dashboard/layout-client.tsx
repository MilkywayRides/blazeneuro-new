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
  const [userPreference, setUserPreference] = useState<boolean | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar:user-preference')
    if (saved) {
      const pref = saved === 'true'
      setUserPreference(pref)
      setOpen(pref)
    }
  }, [])

  useEffect(() => {
    if (userPreference === null) {
      const isCoursePage = /\/dashboard\/courses\/[^/]+/.test(pathname)
      setOpen(!isCoursePage)
    }
  }, [pathname, userPreference])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    setUserPreference(newOpen)
    localStorage.setItem('sidebar:user-preference', String(newOpen))
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
