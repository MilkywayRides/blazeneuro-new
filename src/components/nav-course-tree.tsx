"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { BookOpen, ChevronRight, FileText, Video, HelpCircle, Loader2 } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  order: number
}

type Course = {
  id: string
  title: string
  pages?: Page[]
}

export function NavCourseTree() {
  const { state } = useSidebar()
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()

  const isCollapsed = state === "collapsed"

  const fetchCoursesWithPages = async () => {
    if (courses.length > 0) return // Already fetched
    
    setLoading(true)
    try {
      const res = await fetch("/api/courses")
      const coursesData = await res.json()
      
      // For each course, fetch its details (which include pages)
      const detailedCourses = await Promise.all(
        coursesData.map(async (c: { id: string }) => {
          const detailRes = await fetch(`/api/courses/${c.id}`)
          return await detailRes.json()
        })
      )
      setCourses(detailedCourses)
    } catch (error) {
      console.error("Failed to fetch courses and pages:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Video className="h-3.5 w-3.5" />
      case "ARTICLE": return <FileText className="h-3.5 w-3.5" />
      case "QUIZ": return <HelpCircle className="h-3.5 w-3.5" />
      default: return <FileText className="h-3.5 w-3.5" />
    }
  }

  if (!isCollapsed) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <TooltipProvider delay={0}>
          <Tooltip onOpenChange={(open) => {
            setIsOpen(open)
            if (open) fetchCoursesWithPages()
          }}>
            <TooltipTrigger 
              render={
                <SidebarMenuButton 
                  className={cn(
                    "transition-all duration-200",
                    isOpen && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <BookOpen className="size-4" />
                  <span className="sr-only">Course Tree</span>
                </SidebarMenuButton>
              }
            />
            <TooltipContent 
              side="right" 
              align="start" 
              className="p-0 w-72 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-primary/20 bg-popover rounded-xl"
              sideOffset={12}
            >
              <div className="bg-primary/5 p-4 border-b border-border/50">
                <h4 className="font-bold text-sm flex items-center gap-2 text-primary">
                  <BookOpen className="h-4 w-4" />
                  Quick Navigator
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">
                  Browse your enrolled courses
                </p>
              </div>
              
              <div className="overflow-y-auto flex-1 p-3 space-y-4 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                    <span className="text-xs text-muted-foreground animate-pulse">Building course tree...</span>
                  </div>
                ) : courses.length > 0 ? (
                  courses.map((course) => (
                    <div key={course.id} className="space-y-1.5">
                      <div className="px-2 py-1 text-[11px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                        <div className="h-px flex-1 bg-border/50" />
                        <span>{course.title}</span>
                        <div className="h-px flex-1 bg-border/50" />
                      </div>
                      <div className="space-y-0.5">
                        {course.pages && course.pages.length > 0 ? (
                          course.pages
                            .sort((a, b) => a.order - b.order)
                            .map((page) => (
                              <button
                                key={page.id}
                                onClick={() => router.push(`/dashboard/course-viewer?courseId=${course.id}&pageId=${page.id}`)}
                                className="w-full text-left px-3 py-2 rounded-lg text-[13px] hover:bg-primary/10 transition-all flex items-center gap-2.5 group active:scale-[0.98]"
                              >
                                <span className="text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                                  {getIcon(page.contentType)}
                                </span>
                                <span className="truncate flex-1 font-medium group-hover:text-foreground transition-colors">
                                  {page.title}
                                </span>
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all" />
                              </button>
                            ))
                        ) : (
                          <div className="px-3 py-2 text-[11px] italic text-muted-foreground">
                            No modules in this course
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center flex flex-col items-center gap-2">
                    <BookOpen className="h-8 w-8 text-muted-foreground/20" />
                    <span className="text-xs text-muted-foreground">No active courses found</span>
                  </div>
                )}
              </div>
              
              <div className="p-2 border-t border-border/50 bg-muted/30">
                <button 
                  onClick={() => router.push('/dashboard/courses')}
                  className="w-full py-1.5 text-[11px] font-semibold text-primary hover:underline"
                >
                  View All Courses
                </button>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
