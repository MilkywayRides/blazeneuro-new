"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationButton } from "@/components/notification-button"
import { CourseSwitcher } from "@/components/course-switcher"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Notification = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  read: boolean;
  createdAt: Date;
};

export function SiteHeader({ notifications }: { notifications?: Notification[] }) {
  const pathname = usePathname()
  const showCourseSwitcher = pathname.startsWith("/admin/courses")
  const isAdminDashboard = pathname === "/admin"
  const [courseTitle, setCourseTitle] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(true)

  // Check if we're on a course viewer page
  const isCoursePage = pathname.includes("/dashboard/courses/") && pathname.split("/").length > 3

  useEffect(() => {
    let isMounted = true;
    if (isCoursePage) {
      const courseId = pathname.split("/").pop()
      fetch(`/api/courses/${courseId}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted) setCourseTitle(data.title);
        })
        .catch(() => {
          if (isMounted) setCourseTitle(null);
        })
    }
    return () => { isMounted = false; };
  }, [pathname, isCoursePage])

  useEffect(() => {
    if (!isCoursePage) {
      requestAnimationFrame(() => {
        setCourseTitle(null);
      });
    }
  }, [isCoursePage]);

  const toggleLock = (locked: boolean) => {
    setIsLocked(locked)
    window.dispatchEvent(new CustomEvent("dashboard-lock-change", { detail: { locked } }))
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear bg-background">
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
        {isAdminDashboard && (
          <div className="flex items-center border rounded-md p-0.5 bg-muted/50">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-sm",
                isLocked ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
              )}
              onClick={() => toggleLock(true)}
              title="Lock & Save"
            >
              <Lock className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-sm",
                !isLocked ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
              )}
              onClick={() => toggleLock(false)}
              title="Unlock to Edit"
            >
              <Unlock className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        <NotificationButton notifications={notifications || []} />
      </div>
    </header>
  )
}
