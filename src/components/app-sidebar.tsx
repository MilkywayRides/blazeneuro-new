"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { NavCourses } from "@/components/nav-courses"
import { CourseSelector } from "@/components/course-selector"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LayoutDashboardIcon, UsersIcon, Settings2Icon, CircleHelpIcon, SearchIcon, ShieldIcon, ActivityIcon, DatabaseIcon, FileTextIcon, MessageSquareIcon, BellIcon, BookOpenIcon } from "lucide-react"

const adminData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: (
        <LayoutDashboardIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: (
        <BookOpenIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: (
        <BellIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Live Globe",
      url: "/admin/globe",
      icon: (
        <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Community",
      url: "/admin/community",
      icon: (
        <MessageSquareIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Deploy",
      url: "/admin/deploy",
      icon: (
        <ActivityIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: (
        <UsersIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Blogs",
      url: "/admin/blogs",
      icon: (
        <FileTextIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Create oAuth Apps",
      url: "/admin/oauth",
      icon: (
        <ShieldIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: (
        <ActivityIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Database",
      url: "/admin/database",
      icon: (
        <DatabaseIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Security",
      url: "/admin/security",
      icon: (
        <ShieldIcon className="size-4 shrink-0" />
      ),
    },
  ],
  navSecondary: [
    {
      title: "OAuth Settings",
      url: "/admin/settings/oauth",
      icon: (
        <ShieldIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: (
        <Settings2Icon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Get Help",
      url: "/admin/help",
      icon: (
        <CircleHelpIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Search",
      url: "/admin/search",
      icon: (
        <SearchIcon className="size-4 shrink-0" />
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
        <LayoutDashboardIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Courses",
      url: "/dashboard/courses",
      icon: (
        <BookOpenIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Linked Accounts",
      url: "/dashboard/linked-accounts",
      icon: (
        <UsersIcon className="size-4 shrink-0" />
      ),
    },
    {
      title: "Create oAuth Apps",
      url: "/dashboard/oauth",
      icon: (
        <ShieldIcon className="size-4 shrink-0" />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: (
        <Settings2Icon className="size-4 shrink-0" />
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
  const pathname = usePathname();
  const { open } = useSidebar();
  const isDashboardHome = pathname === "/dashboard";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href={homeUrl}>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
              >
                {!isDashboardHome && (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                    <ShieldIcon className="size-4 shrink-0 transition-none" />
                  </div>
                )}
                <div className={`grid flex-1 text-left leading-tight ${isDashboardHome ? 'text-center' : ''}`}>
                  {open ? (
                    <span className={`truncate font-semibold ${isDashboardHome ? 'text-2xl' : 'text-sm'}`}>{title}</span>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="font-bold text-lg">
                          Bn
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>My Courses</SidebarGroupLabel>
            <SidebarGroupContent>
              <CourseSelector />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {data.documents.length > 0 && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
