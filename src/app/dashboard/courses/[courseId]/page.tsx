"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

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

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null
  
  // Extract video ID from various YouTube URL formats
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

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  quizData?: any[]
  order: number
  completed?: boolean
  userReaction?: boolean | null
  likeCount?: number
  dislikeCount?: number
}

type Publisher = {
  id: string
  name: string
  image?: string
}

type Course = {
  id: string
  title: string
  description?: string
  type: "FREE" | "PAID"
  publisher?: Publisher
  isFollowing?: boolean
  pages: Page[]
}

export default function CourseViewerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const pageId = searchParams.get('pageId')

  useEffect(() => {
    // Redirect to new course viewer
    if (pageId) {
      router.replace(`/dashboard/course-viewer?courseId=${courseId}&pageId=${pageId}`)
    } else {
      // Fetch first page and redirect
      fetch(`/api/courses/${courseId}`)
        .then(res => res.json())
        .then(data => {
          if (data.pages?.[0]) {
            router.replace(`/dashboard/course-viewer?courseId=${courseId}&pageId=${data.pages[0].id}`)
          }
        })
    }
  }, [courseId, pageId, router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <Spinner className="mx-auto" />
        <p className="text-muted-foreground">Redirecting to course viewer...</p>
      </div>
    </div>
  )
}
