"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationButton } from "@/components/notification-button"
import { getNotifications } from "@/app/admin/notifications/actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { usePathname } from "next/navigation"

export async function SiteHeader() {
  const notifications = await getNotifications();

  return (
    <SiteHeaderClient notifications={notifications} />
  )
}

export function SiteHeaderClient({ notifications }: { notifications?: any[] }) {
  const pathname = usePathname()
  const isCoursesActive = pathname.startsWith("/dashboard/courses")
  
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <Link href="/dashboard/courses">
          <Button variant={isCoursesActive ? "secondary" : "ghost"} size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Courses
          </Button>
        </Link>
        <NotificationButton notifications={notifications || []} />
      </div>
    </header>
  )
}
