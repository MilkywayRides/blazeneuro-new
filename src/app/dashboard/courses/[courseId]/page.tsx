"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { Check, ChevronLeft, ChevronRight, Play, Flag } from "lucide-react"

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  order: number
  completed?: boolean
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
    fetchCourse()
  }, [courseId, pageId])

  const fetchCourse = async () => {
    const res = await fetch(`/api/courses/${courseId}`)
    const data = await res.json()
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
  }

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page)
    router.push(`/dashboard/courses/${courseId}?pageId=${page.id}`, { scroll: false })
  }

  const markComplete = async (pageId: string) => {
    await fetch(`/api/courses/${courseId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, completed: true })
    })
    fetchCourse()
  }

  const handleNext = () => {
    if (!course || !selectedPage) return
    const currentIndex = course.pages.findIndex(p => p.id === selectedPage.id)
    if (currentIndex < course.pages.length - 1) {
      markComplete(selectedPage.id)
      handlePageSelect(course.pages[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (!course || !selectedPage) return
    const currentIndex = course.pages.findIndex(p => p.id === selectedPage.id)
    if (currentIndex > 0) {
      handlePageSelect(course.pages[currentIndex - 1])
    }
  }

  const completedCount = course?.pages.filter(p => p.completed).length || 0
  const totalPages = course?.pages.length || 0
  const progress = totalPages > 0 ? Math.round((completedCount / totalPages) * 100) : 0

  if (!course) return <div className="p-6">Loading...</div>

  const showPaywall = course.type === "PAID" && !hasPurchased && !isAdmin && session?.user

  return (
    <div className="flex h-[calc(100vh-3rem)] relative pb-20">
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
        <ScrollArea className="h-full">
          <div className="p-2">
            {course.pages.map((page) => (
              <Button
                key={page.id}
                variant={selectedPage?.id === page.id ? "secondary" : "ghost"}
                className="w-full justify-between mb-1"
                onClick={() => handlePageSelect(page)}
              >
                <span>{page.title}</span>
                {page.completed && <Check className="h-4 w-4 text-green-600" />}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col relative">
        <ScrollArea className="flex-1">
          {selectedPage ? (
            <div className="p-6">
              {selectedPage.contentType === "ARTICLE" && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose max-w-none">
                      {selectedPage.body}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedPage.contentType === "VIDEO" && (
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
              )}

              {selectedPage.contentType === "QUIZ" && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
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
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
          <div className="flex flex-col gap-3 px-6 py-4 rounded-lg border bg-background/80 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3">
              <Play className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Progress value={progress} className="flex-1" />
              <Flag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={!course || !selectedPage || course.pages.findIndex(p => p.id === selectedPage.id) === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                {progress}% Complete ({completedCount}/{totalPages})
              </div>
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!course || !selectedPage || course.pages.findIndex(p => p.id === selectedPage.id) === course.pages.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
