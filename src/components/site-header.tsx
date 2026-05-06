"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationButton } from "@/components/notification-button"
import { CourseSwitcher } from "@/components/course-switcher"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function SiteHeader({ notifications }: { notifications?: any[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const showCourseSwitcher = pathname.startsWith("/admin/courses")
  const [courseTitle, setCourseTitle] = useState<string | null>(null)

  // Check if we're on a course viewer page
  const isCoursePage = pathname.includes("/dashboard/courses/") && pathname.split("/").length > 3

  useEffect(() => {
    if (isCoursePage) {
      const courseId = pathname.split("/").pop()
      fetch(`/api/courses/${courseId}`)
        .then(res => res.json())
        .then(data => setCourseTitle(data.title))
        .catch(() => setCourseTitle(null))
    } else {
      setCourseTitle(null)
    }
  }, [pathname, isCoursePage])

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
      {courseTitle && (
        <div className="flex-1 flex justify-center">
          <h1 className="font-semibold text-base">{courseTitle}</h1>
        </div>
      )}
      <div className="ml-auto flex items-center gap-2 px-4">
        <NotificationButton notifications={notifications || []} />
      </div>
    </header>
  )
}
