"use client"

import { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import useSWR, { mutate } from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function PageReactions({ 
  pageId, 
  initialReaction, 
  initialLikeCount = 0, 
  initialDislikeCount = 0 
}: { 
  pageId: string
  initialReaction?: boolean | null
  initialLikeCount?: number
  initialDislikeCount?: number
}) {
  const { data } = useSWR(`/api/courses/reactions/${pageId}`, fetcher, {
    fallbackData: {
      reaction: initialReaction,
      likeCount: initialLikeCount,
      dislikeCount: initialDislikeCount
    },
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })

  const [reaction, setReaction] = useState<boolean | null>(data?.reaction ?? initialReaction ?? null)
  const [likeCount, setLikeCount] = useState(data?.likeCount ?? initialLikeCount)
  const [dislikeCount, setDislikeCount] = useState(data?.dislikeCount ?? initialDislikeCount)

  useEffect(() => {
    if (data) {
      setReaction(data.reaction ?? null)
      setLikeCount(data.likeCount ?? 0)
      setDislikeCount(data.dislikeCount ?? 0)
    }
  }, [data])

  const handleReaction = async (liked: boolean) => {
    const prevReaction = reaction
    const prevLikeCount = likeCount
    const prevDislikeCount = dislikeCount

    // Instant UI update
    if (reaction === liked) {
      setReaction(null)
      if (liked) {
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        setDislikeCount(prev => Math.max(0, prev - 1))
      }
    } else {
      setReaction(liked)
      if (reaction !== null) {
        if (liked) {
          setLikeCount(prev => prev + 1)
          setDislikeCount(prev => Math.max(0, prev - 1))
        } else {
          setLikeCount(prev => Math.max(0, prev - 1))
          setDislikeCount(prev => prev + 1)
        }
      } else {
        if (liked) {
          setLikeCount(prev => prev + 1)
        } else {
          setDislikeCount(prev => prev + 1)
        }
      }
    }

    try {
      if (prevReaction === liked) {
        await fetch("/api/courses/reactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId })
        })
      } else {
        await fetch("/api/courses/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, liked })
        })
      }
      
      // Revalidate to sync with server
      mutate(`/api/courses/reactions/${pageId}`)
    } catch (error) {
      // Revert on error
      setReaction(prevReaction)
      setLikeCount(prevLikeCount)
      setDislikeCount(prevDislikeCount)
    }
  }

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
      <button
        onClick={() => handleReaction(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
          reaction === true
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
      >
        <ThumbsUp className={cn(
          "w-5 h-5 transition-transform",
          reaction === true && "scale-110"
        )} />
        <span className="text-sm font-medium">{likeCount}</span>
      </button>
      <div className="w-px h-6 bg-border" />
      <button
        onClick={() => handleReaction(false)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
          reaction === false
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
      >
        <ThumbsDown className={cn(
          "w-5 h-5 transition-transform",
          reaction === false && "scale-110"
        )} />
        <span className="text-sm font-medium">{dislikeCount}</span>
      </button>
    </div>
  )
}
