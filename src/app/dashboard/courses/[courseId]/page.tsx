"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { Check, ChevronLeft, ChevronRight, Play, Flag, Video, FileText, HelpCircle } from "lucide-react"
import { PageReactions } from "@/components/page-reactions"

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
    <path opacity="0.4" d="M8.19486 5.40705C8.52237 4.96235 9.14837 4.86736 9.59306 5.19488C9.93847 5.44927 10.2668 5.70372 10.5528 5.92689C11.1236 6.3724 11.8882 6.98573 12.6556 7.65208C13.4181 8.31412 14.2064 9.04815 14.8119 9.73344C15.1136 10.0749 15.3911 10.4279 15.5986 10.7721C15.7895 11.0888 16 11.524 16 12.0001C16 12.4762 15.7895 12.9115 15.5986 13.2282C15.3911 13.5724 15.1136 13.9253 14.8119 14.2668C14.2064 14.9521 13.4181 15.6861 12.6556 16.3482C11.8882 17.0145 11.1236 17.6278 10.5528 18.0734C10.2668 18.2965 9.93847 18.551 9.59307 18.8054C9.14837 19.1329 8.52237 19.0379 8.19486 18.5932C8.0632 18.4144 7.99983 18.2064 8.00001 18.0002L8 12.0001L8 6.00007C7.99983 5.79387 8.0632 5.58581 8.19486 5.40705Z" fill="currentColor"/>
    <path d="M14.8119 9.73344C15.1136 10.0749 15.3911 10.4279 15.5986 10.7721C15.7895 11.0888 16 11.524 16 12.0001C16 12.4762 15.7895 12.9115 15.5986 13.2282C15.3911 13.5724 15.1136 13.9253 14.8119 14.2668C14.2064 14.9521 13.4181 15.6861 12.6556 16.3482C11.8882 17.0145 11.1236 17.6278 10.5528 18.0734C10.2668 18.2965 9.93847 18.551 9.59307 18.8054C9.14837 19.1329 8.52237 19.0379 8.19486 18.5932C8.0632 18.4144 7.99983 18.2064 8.00001 18.0002L8 13L13.0509 8C13.6843 8.56556 14.3107 9.1662 14.8119 9.73344Z" fill="currentColor"/>
  </svg>
)

const TickIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
    <path opacity="0.4" fillRule="evenodd" clipRule="evenodd" d="M4.29289 13.2929C4.68342 12.9024 5.31658 12.9024 5.70711 13.2929L9.20711 16.7929C9.59763 17.1834 9.59763 17.8166 9.20711 18.2071C8.81658 18.5976 8.18342 18.5976 7.79289 18.2071L4.29289 14.7071C3.90237 14.3166 3.90237 13.6834 4.29289 13.2929Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M19.6905 5.77665C20.09 6.15799 20.1047 6.79098 19.7234 7.19048L9.22336 18.1905C8.84202 18.59 8.20902 18.6047 7.80953 18.2234C7.41003 17.842 7.39531 17.209 7.77665 16.8095L18.2766 5.80953C18.658 5.41003 19.291 5.39531 19.6905 5.77665Z" fill="currentColor"/>
  </svg>
)

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  order: number
  completed?: boolean
  userReaction?: boolean | null
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
  const [loading, setLoading] = useState(true)
  const { data: session } = authClient.useSession()

  const isAdmin = (session?.user as any)?.role === "admin"

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  useEffect(() => {
    if (!course || !pageId) return
    const page = course.pages.find((p: Page) => p.id === pageId)
    if (page) {
      setSelectedPage(page)
    }
  }, [pageId, course])

  const fetchCourse = async () => {
    setLoading(true)
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
    setLoading(false)
  }

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page)
    router.replace(`/dashboard/courses/${courseId}?pageId=${page.id}`, { scroll: false })
  }

  const markComplete = async (pageId: string) => {
    // Optimistically update UI
    if (course) {
      const updatedPages = course.pages.map(p => 
        p.id === pageId ? { ...p, completed: true } : p
      )
      setCourse({ ...course, pages: updatedPages })
    }

    // Update in background
    fetch(`/api/courses/${courseId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, completed: true })
    }).catch(err => console.error("Failed to save progress:", err))
  }

  const handleNext = () => {
    if (!course || !selectedPage) return
    const currentIndex = course.pages.findIndex(p => p.id === selectedPage.id)
    
    // Mark current page as complete
    markComplete(selectedPage.id)
    
    // If last page, mark as complete and stay
    if (currentIndex === course.pages.length - 1) {
      return
    }
    
    // Move to next page
    handlePageSelect(course.pages[currentIndex + 1])
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
  const isLastPage = course && selectedPage && course.pages.findIndex(p => p.id === selectedPage.id) === course.pages.length - 1
  const allCompleted = completedCount === totalPages

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3rem)]">
        <div className="w-64 border-r p-2 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="aspect-video w-full" />
        </div>
      </div>
    )
  }

  if (!course) return null

  const showPaywall = course.type === "PAID" && !hasPurchased && !isAdmin && session?.user

  return (
    <div className="flex h-full overflow-hidden relative">
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
      <div className="w-64 border-r flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div className="p-2">
            {course.pages.map((page) => {
              const Icon = page.contentType === "VIDEO" ? Video : page.contentType === "ARTICLE" ? FileText : HelpCircle
              return (
                <Button
                  key={page.id}
                  variant={selectedPage?.id === page.id ? "secondary" : "ghost"}
                  className="w-full justify-between mb-1"
                  onClick={() => handlePageSelect(page)}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {page.title}
                  </span>
                  {page.completed && <TickIcon className="h-4 w-4 text-green-600 dark:text-green-500" />}
                </Button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col relative h-full">
        <ScrollArea className="flex-1">
          <div className="p-6 pb-24">
            {selectedPage ? (
              <>
                {selectedPage.contentType === "ARTICLE" && (
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <div className="prose max-w-none">
                        {selectedPage.body}
                      </div>
                      <div className="flex justify-center pt-4 border-t">
                        <PageReactions pageId={selectedPage.id} initialReaction={selectedPage.userReaction} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedPage.contentType === "VIDEO" && (
                  <div className="space-y-4">
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
                    <div className="flex justify-center">
                      <PageReactions pageId={selectedPage.id} initialReaction={selectedPage.userReaction} />
                    </div>
                  </div>
                )}

                {selectedPage.contentType === "QUIZ" && (
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <p>Quiz coming soon</p>
                      <Badge>Coming Soon</Badge>
                      <div className="flex justify-center pt-4 border-t">
                        <PageReactions pageId={selectedPage.id} initialReaction={selectedPage.userReaction} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a page to view content
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
          <div className="flex items-center justify-between gap-4 px-6 py-3 rounded-lg border bg-card/80 backdrop-blur-md shadow-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={!course || !selectedPage || course.pages.findIndex(p => p.id === selectedPage.id) === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Play className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Progress value={progress} className="flex-1 transition-all duration-300" />
              <Flag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground whitespace-nowrap transition-all duration-300">{completedCount}/{totalPages}</span>
            </div>

            <Button
              size="sm"
              onClick={handleNext}
              disabled={!course || !selectedPage || allCompleted}
            >
              {isLastPage ? (
                <>
                  <TickIcon className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
