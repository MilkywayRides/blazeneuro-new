"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Course = {
  id: string
  title: string
  type: "FREE" | "PAID"
  pageCount: number
}

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else if (Array.isArray(data)) {
          setCourses(data)
        } else {
          setError("Invalid response from server")
        }
      })
      .catch(err => setError("Failed to load courses"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Course Catalog</h1>
          <p className="text-muted-foreground mt-2">Explore our courses and start learning</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses available yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-muted-foreground mt-2">Explore our courses and start learning</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge variant={course.type === "FREE" ? "default" : "destructive"}>
                  {course.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{course.pageCount} pages</p>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/courses/${course.id}`} className="w-full">
                <Button className="w-full">View Course</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
