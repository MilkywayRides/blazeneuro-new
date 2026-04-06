"use client"

import { useEffect, useState } from "react"

export function RelativeTime({ date }: { date: Date | string }) {
  const [timeAgo, setTimeAgo] = useState("")
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const past = new Date(date)
      const diffMs = now.getTime() - past.getTime()
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffSec / 60)
      const diffHour = Math.floor(diffMin / 60)
      const diffDay = Math.floor(diffHour / 24)
      
      let relative = ""
      if (diffDay > 0) {
        relative = `${diffDay} day${diffDay > 1 ? "s" : ""} ago`
      } else if (diffHour > 0) {
        relative = `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`
      } else if (diffMin > 0) {
        relative = `${diffMin} min ago`
      } else {
        relative = `${diffSec} sec ago`
      }
      
      const formatted = past.toLocaleDateString("en-US", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })
      
      setTimeAgo(`${formatted} · ${relative}`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [date])
  
  return <span className="text-muted-foreground">{timeAgo}</span>
}
