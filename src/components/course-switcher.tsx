"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
import { usePathname, useRouter } from "next/navigation"

type Course = {
  id: string
  title: string
}

export function CourseSwitcher() {
  const [open, setOpen] = React.useState(false)
  const [courses, setCourses] = React.useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    fetch("/api/admin/courses")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCourses(data)
          // Auto-select if on a course page
          const match = pathname.match(/\/admin\/courses\/([^\/]+)/)
          if (match) {
            const course = data.find(c => c.id === match[1])
            if (course) setSelectedCourse(course)
          }
        }
      })
  }, [pathname])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedCourse ? selectedCourse.title : "Select course..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search course..." />
          <CommandList>
            <CommandEmpty>No course found.</CommandEmpty>
            <CommandGroup>
              {courses.map((course) => (
                <CommandItem
                  key={course.id}
                  value={course.title}
                  onSelect={() => {
                    setSelectedCourse(course)
                    setOpen(false)
                    router.push(`/admin/courses/${course.id}`)
                  }}
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
  )
}
