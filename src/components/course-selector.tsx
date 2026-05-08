"use client"

import * as React from "react"
import { Check, ChevronsUpDown, BookOpen, Video, FileText, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

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

export function CourseSelector() {
  const [open, setOpen] = React.useState(false)
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null)
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingPages, setLoadingPages] = React.useState(false)
  const [showPages, setShowPages] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    fetchCourses()
    const saved = localStorage.getItem("selected-course-id")
    if (saved) {
      setShowPages(true)
      fetchCourseDetails(saved)
    }
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses")
      const data = await res.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseDetails = async (courseId: string) => {
    setLoadingPages(true)
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      const data = await res.json()
      setSelectedCourse(data)
    } catch (error) {
      console.error("Failed to fetch course details:", error)
    } finally {
      setLoadingPages(false)
    }
  }

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course)
    localStorage.setItem("selected-course-id", course.id)
    fetchCourseDetails(course.id)
    setOpen(false)
    setShowPages(true)
  }

  const handleAllCourses = () => {
    setSelectedCourse(null)
    localStorage.removeItem("selected-course-id")
    setShowPages(false)
    setOpen(false)
    router.push("/dashboard/courses")
  }

  const handlePageClick = (pageId: string) => {
    if (selectedCourse) {
      router.push(`/dashboard/course-viewer?courseId=${selectedCourse.id}&pageId=${pageId}`)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Video className="h-4 w-4" />
      case "ARTICLE": return <FileText className="h-4 w-4" />
      case "QUIZ": return <HelpCircle className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full">
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 px-2"
          >
            <span className="truncate">{selectedCourse ? selectedCourse.title : "All Courses"}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search course..." />
            <CommandList>
              <CommandEmpty>No course found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all-courses"
                  onSelect={handleAllCourses}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !selectedCourse ? "opacity-100" : "opacity-0"
                    )}
                  />
                  All Courses
                </CommandItem>
                {courses.map((course) => (
                  <CommandItem
                    key={course.id}
                    value={course.title}
                    onSelect={() => handleSelectCourse(course)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCourse?.id === course.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {course.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showPages && (
        loadingPages ? (
          <div className="space-y-1 px-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : selectedCourse?.pages && selectedCourse.pages.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-28rem)]">
            <div className="space-y-1">
              {selectedCourse.pages.map((page) => (
                <Button
                  key={page.id}
                  variant="ghost"
                  className="w-full justify-start text-sm h-9 px-2"
                  onClick={() => handlePageClick(page.id)}
                >
                  {getIcon(page.contentType)}
                  <span className="ml-2 truncate">{page.title}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : null
      )}
    </div>
  )
}
