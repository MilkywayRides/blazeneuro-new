"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Quiz } from "@/components/quiz"
import { PageReactions } from "@/components/page-reactions"
import { VideoInfo } from "@/components/video-info"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { ChevronLeft, ChevronRight, Play, Flag, Lock } from "lucide-react"

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  quizData?: any[]
  userReaction?: boolean | null
  likeCount?: number
  dislikeCount?: number
  completed?: boolean
  isLocked?: boolean
}

type Publisher = {
  id: string
  name: string
  image?: string
}

type Course = {
  id: string
  title: string
  type: "FREE" | "PAID"
  price?: number
  isPurchased?: boolean
  publisher?: Publisher
  isFollowing?: boolean
  pages: Page[]
}

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null
  let videoId = null
  
  if (url.includes('youtube.com/watch?v=') || url.includes('www.youtube.com/watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0]?.split('?')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]
  } else if (url.includes('youtube.com/embed/') || url.includes('www.youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0]?.split('&')[0]
  }
  
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
}

export default function CourseViewerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = searchParams.get('courseId')
  const pageId = searchParams.get('pageId')
  const [course, setCourse] = useState<Course | null>(null)
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId && pageId) {
      fetchPage()
    }
  }, [courseId, pageId])

  const fetchPage = async () => {
    if (!courseId || !pageId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      const data = await res.json()
      console.log("Course data:", data)
      setCourse(data)
      const foundPage = data.pages?.find((p: Page) => p.id === pageId)
      if (foundPage) {
        setPage(foundPage)
      }
    } catch (error) {
      console.error("Failed to fetch page:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!course || !page) return
    const currentIndex = course.pages.findIndex(p => p.id === page.id)
    
    // Mark current page as complete
    markComplete(page.id)
    
    if (currentIndex < course.pages.length - 1) {
      const nextPage = course.pages[currentIndex + 1]
      router.push(`/dashboard/course-viewer?courseId=${courseId}&pageId=${nextPage.id}`, { scroll: false })
    }
  }

  const handlePrevious = () => {
    if (!course || !page) return
    const currentIndex = course.pages.findIndex(p => p.id === page.id)
    if (currentIndex > 0) {
      const prevPage = course.pages[currentIndex - 1]
      router.push(`/dashboard/course-viewer?courseId=${courseId}&pageId=${prevPage.id}`, { scroll: false })
    }
  }

  const markComplete = async (pageId: string) => {
    if (!course || !courseId) return
    
    // Update in background
    try {
      await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, completed: true })
      })
      
      // Refetch course to get updated progress
      const res = await fetch(`/api/courses/${courseId}`)
      const data = await res.json()
      setCourse(data)
    } catch (err) {
      console.error("Failed to save progress:", err)
    }
  }

  const completedCount = course?.pages.filter(p => p.completed).length || 0
  const totalPages = course?.pages.length || 0
  const progress = totalPages > 0 ? Math.round((completedCount / totalPages) * 100) : 0
  const currentIndex = course && page ? course.pages.findIndex(p => p.id === page.id) : -1

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="aspect-video w-full" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-6">
        Select a course and page from the sidebar
      </div>
    )
  }

  if (page.isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="size-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">This module is locked</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Purchase this course to get full access to all modules and materials.
          </p>
        </div>
        <Card className="max-w-sm w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-4xl font-bold">${((course?.price || 0) / 100).toFixed(2)}</div>
            <Button className="w-full" size="lg">Buy Course Now</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-6 pb-24 space-y-4">
      {page.contentType === "ARTICLE" && (
        <Card>
          <CardContent className="pt-6">
            <MarkdownRenderer content={page.body || ""} />
          </CardContent>
          <CardFooter className="flex justify-center pt-4 border-t">
            <PageReactions 
              pageId={page.id} 
              initialReaction={page.userReaction}
              initialLikeCount={page.likeCount || 0}
              initialDislikeCount={page.dislikeCount || 0}
            />
          </CardFooter>
        </Card>
      )}

      {page.contentType === "VIDEO" && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-0">
            {page.videoUrl ? (
              <div className="aspect-video bg-black rounded-t-xl overflow-hidden">
                {(() => {
                  const embedUrl = getYouTubeEmbedUrl(page.videoUrl)
                  if (embedUrl) {
                    return (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        title="YouTube video player"
                      />
                    )
                  }
                  return (
                    <video
                      src={page.videoUrl}
                      className="w-full h-full"
                      controls
                    />
                  )
                })()}
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-t-xl flex items-center justify-center">
                <p className="text-muted-foreground">No video URL provided</p>
              </div>
            )}
            
            <div className="p-6 space-y-4">
              <VideoInfo
                title={page.title}
                publisher={course?.publisher || null}
                isFollowing={course?.isFollowing || false}
                courseId={courseId!}
                pageId={page.id}
                userReaction={page.userReaction}
                likeCount={page.likeCount}
                dislikeCount={page.dislikeCount}
              />

              {page.body && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <details className="group" open>
                    <summary className="cursor-pointer font-medium text-sm mb-2 list-none flex items-center justify-between">
                      <span>Description</span>
                      <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-2">
                      <MarkdownRenderer content={page.body} />
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {page.contentType === "QUIZ" && (
        <div className="space-y-4">
          <Quiz questions={page.quizData || []} pageId={page.id} />
          <Card>
            <CardFooter className="flex justify-center pt-4">
              <PageReactions 
                pageId={page.id} 
                initialReaction={page.userReaction}
                initialLikeCount={page.likeCount || 0}
                initialDislikeCount={page.dislikeCount || 0}
              />
            </CardFooter>
          </Card>
        </div>
      )}
    </div>

    {/* Bottom Navigation */}
    {course && page && (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-full md:max-w-4xl px-2 md:px-6 z-10">
        <div className="flex items-center gap-2 md:gap-4 px-3 md:px-6 py-3 rounded-xl border bg-card/95 backdrop-blur-md shadow-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Previous</span>
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            <Play className="h-4 w-4 text-muted-foreground shrink-0" />
            <Progress value={progress} className="flex-1 h-2" />
            <Flag className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{completedCount}/{totalPages}</span>
          </div>
          
          <Button
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === totalPages - 1}
            className="bg-foreground text-background hover:bg-foreground/90 ml-auto"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="h-4 w-4 md:ml-2" />
          </Button>
        </div>
      </div>
    )}
  </div>
  )
}
