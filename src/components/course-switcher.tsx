"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter } from "next/navigation"

type Course = {
  id: string
  title: string
}

export function CourseSwitcher() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = React.useState<string>("")
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    fetch("/api/admin/courses")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCourses(data)
          const match = pathname.match(/\/admin\/courses\/([^\/]+)/)
          if (match) {
            setSelectedCourse(match[1])
          }
        }
      })
  }, [pathname])

  const selectedCourseTitle = courses.find(c => c.id === selectedCourse)?.title

  return (
    <Select value={selectedCourse} onValueChange={(value) => {
      setSelectedCourse(value)
      router.push(`/admin/courses/${value}`)
    }}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select course...">
          {selectedCourseTitle || "Select course..."}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {courses.map((course) => (
          <SelectItem key={course.id} value={course.id}>
            {course.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
