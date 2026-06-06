"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  publisherId: string
  initialIsFollowing: boolean
  isLoggedIn: boolean
}

export function FollowButton({ publisherId, initialIsFollowing, isLoggedIn }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggleFollow = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to follow creators")
      router.push("/api/auth/login") // Or wherever the login page is
      return
    }

    setLoading(true)
    try {
      const method = isFollowing ? "DELETE" : "POST"
      const res = await fetch("/api/courses/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publisherId })
      })

      if (res.ok) {
        setIsFollowing(!isFollowing)
        toast.success(isFollowing ? "Unfollowed creator" : "Following creator")
      } else {
        toast.error("Failed to update follow status")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      className={`rounded-full px-6 font-bold ${
        isFollowing 
          ? "bg-muted text-foreground hover:bg-muted/80" 
          : "bg-foreground text-background hover:bg-foreground/90"
      }`}
      onClick={handleToggleFollow}
      disabled={loading}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  )
}
