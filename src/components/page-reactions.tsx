"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"

export function PageReactions({ pageId, initialReaction }: { pageId: string, initialReaction?: boolean | null }) {
  const [reaction, setReaction] = useState<boolean | null>(initialReaction ?? null)
  const [loading, setLoading] = useState(false)

  const handleReaction = async (liked: boolean) => {
    setLoading(true)
    try {
      if (reaction === liked) {
        // Remove reaction
        await fetch("/api/courses/reactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId })
        })
        setReaction(null)
      } else {
        // Add/update reaction
        await fetch("/api/courses/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, liked })
        })
        setReaction(liked)
      }
    } catch (error) {
      console.error("Failed to update reaction", error)
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
            : "bg-card border-border hover:bg-accent"
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="text-sm">Helpful</span>
      </button>
      <button
        onClick={() => handleReaction(false)}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          reaction === false
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "bg-card border-border hover:bg-accent"
        }`}
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="text-sm">Not Helpful</span>
      </button>
    </div>
  )
}
