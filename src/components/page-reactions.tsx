"use client"

import { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [reaction, setReaction] = useState<boolean | null>(initialReaction ?? null)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount)

  useEffect(() => {
    setReaction(initialReaction ?? null)
    setLikeCount(initialLikeCount)
    setDislikeCount(initialDislikeCount)
  }, [pageId])

  const handleReaction = async (liked: boolean) => {
    const prevReaction = reaction
    const prevLikeCount = likeCount
    const prevDislikeCount = dislikeCount

    // Instant UI update (YouTube-style)
    if (reaction === liked) {
      // Remove reaction
      setReaction(null)
      if (liked) {
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        setDislikeCount(prev => Math.max(0, prev - 1))
      }
    } else {
      // Add/switch reaction
      setReaction(liked)
      if (reaction !== null) {
        // Switching
        if (liked) {
          setLikeCount(prev => prev + 1)
          setDislikeCount(prev => Math.max(0, prev - 1))
        } else {
          setLikeCount(prev => Math.max(0, prev - 1))
          setDislikeCount(prev => prev + 1)
        }
      } else {
        // New reaction
        if (liked) {
          setLikeCount(prev => prev + 1)
        } else {
          setDislikeCount(prev => prev + 1)
        }
      }
    }

    // Background API call
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
