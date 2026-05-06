"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationButton } from "@/components/notification-button"
import { CourseSwitcher } from "@/components/course-switcher"
import { usePathname } from "next/navigation"

export function SiteHeader({ notifications }: { notifications?: any[] }) {
  const pathname = usePathname()
  const showCourseSwitcher = pathname.startsWith("/admin/courses")

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        {showCourseSwitcher && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <CourseSwitcher />
          </>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <NotificationButton notifications={notifications || []} />
      </div>
    </header>
  )
}
