"use client"

import { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setReaction(initialReaction ?? null)
    setLikeCount(initialLikeCount)
    setDislikeCount(initialDislikeCount)
  }, [initialReaction, initialLikeCount, initialDislikeCount])

  const handleReaction = async (liked: boolean) => {
    setLoading(true)
    const prevReaction = reaction
    const prevLikeCount = likeCount
    const prevDislikeCount = dislikeCount

    try {
      if (reaction === liked) {
        // Remove reaction - optimistic update
        setReaction(null)
        if (liked) {
          setLikeCount(prev => Math.max(0, prev - 1))
        } else {
          setDislikeCount(prev => Math.max(0, prev - 1))
        }
        
        const res = await fetch("/api/courses/reactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId })
        })
        
        if (!res.ok) throw new Error("Failed to remove reaction")
      } else {
        // Add/update reaction - optimistic update
        setReaction(liked)
        if (reaction !== null) {
          // Switching from one to another
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
        
        const res = await fetch("/api/courses/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, liked })
        })
        
        if (!res.ok) throw new Error("Failed to add reaction")
      }
    } catch (error) {
      console.error("Failed to update reaction", error)
      // Revert on error
      setReaction(prevReaction)
      setLikeCount(prevLikeCount)
      setDislikeCount(prevDislikeCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleReaction(true)}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          reaction === true
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="text-sm font-medium">{likeCount}</span>
      </button>
      <button
        onClick={() => handleReaction(false)}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          reaction === false
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="text-sm font-medium">{dislikeCount}</span>
      </button>
    </div>
  )
}
