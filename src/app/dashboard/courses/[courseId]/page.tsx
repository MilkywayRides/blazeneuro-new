"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  order: number
}

type Course = {
  id: string
  title: string
  type: "FREE" | "PAID"
  pages: Page[]
}

export default function CourseViewerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const pageId = searchParams.get('pageId')
  const [course, setCourse] = useState<Course | null>(null)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const { data: session } = authClient.useSession()

  const isAdmin = (session?.user as any)?.role === "admin"

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data)
        if (pageId) {
          const page = data.pages.find((p: Page) => p.id === pageId)
          if (page) {
            setSelectedPage(page)
          } else if (data.pages.length > 0) {
            setSelectedPage(data.pages[0])
          }
        } else if (data.pages.length > 0) {
          setSelectedPage(data.pages[0])
        }
      })
  }, [courseId, pageId])

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page)
    router.push(`/dashboard/courses/${courseId}?pageId=${page.id}`, { scroll: false })
  }

  if (!course) return <div className="p-6">Loading...</div>

  const showPaywall = course.type === "PAID" && !hasPurchased && !isAdmin && session?.user

  return (
    <div className="flex h-[calc(100vh-3rem)] relative">
      {showPaywall && (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-background/80">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{course.title}</CardTitle>
                <Badge>Premium Course</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Unlock full access to this course</p>
              <Badge variant="outline">Price coming soon</Badge>
            </CardContent>
            <CardFooter className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button disabled className="flex-1">Enroll Now</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Payment integration coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" className="flex-1">
                <Link href="/login">Sign In</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Left Sidebar - Page List */}
      <div className="w-64 border-r">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{course.title}</h2>
          <Badge variant={course.type === "FREE" ? "default" : "destructive"} className="mt-2">
            {course.type}
          </Badge>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-2">
            {course.pages.map((page) => (
              <Button
                key={page.id}
                variant={selectedPage?.id === page.id ? "secondary" : "ghost"}
                className="w-full justify-start mb-1"
                onClick={() => handlePageSelect(page)}
              >
                {page.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-auto">
        {selectedPage ? (
          <div className="p-6">
            {selectedPage.contentType === "ARTICLE" && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedPage.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {selectedPage.body}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedPage.contentType === "VIDEO" && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedPage.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {selectedPage.videoUrl?.includes('youtube.com') || selectedPage.videoUrl?.includes('youtu.be') ? (
                      <iframe
                        src={selectedPage.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <video
                        src={selectedPage.videoUrl}
                        className="w-full h-full"
                        controls
                        autoPlay
                        loop
                        muted
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedPage.contentType === "QUIZ" && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedPage.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Quiz coming soon</p>
                  <Badge>Coming Soon</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a page to view content
          </div>
        )}
      </div>
    </div>
  )
}
