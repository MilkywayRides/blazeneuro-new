"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CheckIcon, BookOpenIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

type Course = {
  id: string
  title: string
  type: string
}

export function NavCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => setCourses([]))
  }, [])

  if (courses.length === 0) return null

  return (
    <>
      <Separator className="my-2" />
      <SidebarGroup>
        <SidebarGroupLabel>Courses</SidebarGroupLabel>
        <SidebarMenu>
          {courses.map((course) => {
            const isActive = pathname === `/dashboard/courses/${course.id}`
            return (
              <SidebarMenuItem key={course.id}>
                <SidebarMenuButton render={<a href={`/dashboard/courses/${course.id}`} />}>
                  <BookOpenIcon className="h-4 w-4" />
                  <span>{course.title}</span>
                  {isActive && <CheckIcon className="ml-auto h-4 w-4" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
