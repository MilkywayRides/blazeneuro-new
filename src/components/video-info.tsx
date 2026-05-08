"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, UserPlus, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { PageReactions } from "@/components/page-reactions"

type Publisher = {
  id: string
  name: string
  image?: string
}

export function VideoInfo({
  title,
  publisher,
  isFollowing: initialFollowing,
  courseId,
  pageId,
  userReaction,
  likeCount,
  dislikeCount
}: {
  title: string
  publisher?: Publisher | null
  isFollowing?: boolean
  courseId: string
  pageId: string
  userReaction?: boolean | null
  likeCount?: number
  dislikeCount?: number
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing || false)

  const handleFollow = async () => {
    if (!publisher) return
    
    const prev = isFollowing
    setIsFollowing(!isFollowing)

    try {
      const res = await fetch("/api/courses/follow", {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publisherId: publisher.id })
      })

      if (!res.ok) throw new Error()
      toast.success(isFollowing ? "Unfollowed" : "Following")
    } catch {
      setIsFollowing(prev)
      toast.error("Failed to update")
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/course-viewer?courseId=${courseId}&pageId=${pageId}`
    
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {
        navigator.clipboard.writeText(url)
        toast.success("Link copied!")
      })
    } else {
      navigator.clipboard.writeText(url)
      toast.success("Link copied!")
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {publisher ? (
            <>
              <Avatar className="h-10 w-10">
                <AvatarImage src={publisher.image || undefined} />
                <AvatarFallback>{publisher.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{publisher.name}</span>
              </div>
              <Button
                onClick={handleFollow}
                size="sm"
                variant={isFollowing ? "secondary" : "default"}
                className="ml-2 rounded-full"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">No creator info</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <PageReactions 
            pageId={pageId} 
            initialReaction={userReaction}
            initialLikeCount={likeCount || 0}
            initialDislikeCount={dislikeCount || 0}
          />
          <Button
            onClick={handleShare}
            size="sm"
            variant="secondary"
            className="rounded-full h-10 px-4"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
