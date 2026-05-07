"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { NavCourses } from "@/components/nav-courses"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, UsersIcon, Settings2Icon, CircleHelpIcon, SearchIcon, ShieldIcon, ActivityIcon, DatabaseIcon, FileTextIcon, MessageSquareIcon, BellIcon, BookOpenIcon } from "lucide-react"

const adminData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: (
        <LayoutDashboardIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: (
        <BookOpenIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: (
        <BellIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Live Globe",
      url: "/admin/globe",
      icon: (
        <svg className="size-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Community",
      url: "/admin/community",
      icon: (
        <MessageSquareIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Deploy",
      url: "/admin/deploy",
      icon: (
        <ActivityIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: (
        <UsersIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Blogs",
      url: "/admin/blogs",
      icon: (
        <FileTextIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Create oAuth Apps",
      url: "/admin/oauth",
      icon: (
        <ShieldIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: (
        <ActivityIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Database",
      url: "/admin/database",
      icon: (
        <DatabaseIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Security",
      url: "/admin/security",
      icon: (
        <ShieldIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
  ],
  navSecondary: [
    {
      title: "OAuth Settings",
      url: "/admin/settings/oauth",
      icon: (
        <ShieldIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: (
        <Settings2Icon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Get Help",
      url: "/admin/help",
      icon: (
        <CircleHelpIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Search",
      url: "/admin/search",
      icon: (
        <SearchIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
  ],
  documents: [],
}

const userDashboardData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Courses",
      url: "/dashboard/courses",
      icon: (
        <BookOpenIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Linked Accounts",
      url: "/dashboard/linked-accounts",
      icon: (
        <UsersIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
    {
      title: "Create oAuth Apps",
      url: "/dashboard/oauth",
      icon: (
        <ShieldIcon className="size-4 shrink-0 text-gray-500" />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: (
        <Settings2Icon className="size-4 shrink-0 text-gray-500" />
      ),
    },
  ],
  documents: [],
}

export function AppSidebar({ userData, isAdmin = true, ...props }: React.ComponentProps<typeof Sidebar> & { userData?: { name: string; email: string; avatar: string }, isAdmin?: boolean }) {
  const user = userData || {
    name: "Admin",
    email: "admin@blazeneuro.com",
    avatar: "/avatars/admin.jpg",
  };

  const data = isAdmin ? adminData : userDashboardData;
  const homeUrl = isAdmin ? "/admin" : "/dashboard";
  const title = isAdmin ? "BlazeNeuro Admin" : "BlazeNeuro";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ShieldIcon className="size-4 shrink-0" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{title}</span>
              </div>
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
