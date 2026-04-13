"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, UsersIcon, Settings2Icon, CircleHelpIcon, SearchIcon, ShieldIcon, ActivityIcon, DatabaseIcon, FileTextIcon, MessageSquareIcon, BellIcon } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: (
        <LayoutDashboardIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: (
        <BellIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Live Globe",
      url: "/admin/globe",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Community",
      url: "/admin/community",
      icon: (
        <MessageSquareIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Deploy",
      url: "/admin/deploy",
      icon: (
        <ActivityIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: (
        <UsersIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Blogs",
      url: "/admin/blogs",
      icon: (
        <FileTextIcon className="h-4 w-4" />
      ),
    },
    {
      title: "OAuth Apps",
      url: "/admin/oauth",
      icon: (
        <ShieldIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: (
        <ActivityIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Database",
      url: "/admin/database",
      icon: (
        <DatabaseIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Security",
      url: "/admin/security",
      icon: (
        <ShieldIcon className="h-4 w-4" />
      ),
    },
  ],
  navSecondary: [
    {
      title: "OAuth Settings",
      url: "/admin/settings/oauth",
      icon: (
        <ShieldIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: (
        <Settings2Icon className="h-4 w-4" />
      ),
    },
    {
      title: "Get Help",
      url: "/admin/help",
      icon: (
        <CircleHelpIcon className="h-4 w-4" />
      ),
    },
    {
      title: "Search",
      url: "/admin/search",
      icon: (
        <SearchIcon className="h-4 w-4" />
      ),
    },
  ],
  documents: [],
}

export function AppSidebar({ userData, ...props }: React.ComponentProps<typeof Sidebar> & { userData?: { name: string; email: string; avatar: string } }) {
  const user = userData || {
    name: "Admin",
    email: "admin@blazeneuro.com",
    avatar: "/avatars/admin.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/admin" />}
            >
              <ShieldIcon className="size-5!" />
              <span className="text-base font-semibold">BlazeNeuro Admin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {data.documents.length > 0 && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
