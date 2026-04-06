"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { submitBlogFeedback } from "@/app/blogs/actions";

export function BlogFeedback({ blogId, initialLikes, initialDislikes }: { 
  blogId: string; 
  initialLikes: number; 
  initialDislikes: number; 
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userFeedback, setUserFeedback] = useState<boolean | null>(null);

  const handleFeedback = async (liked: boolean) => {
    if (userFeedback === liked) return;

    await submitBlogFeedback(blogId, liked);
    
    if (userFeedback === null) {
      if (liked) {
        setLikes(likes + 1);
      } else {
        setDislikes(dislikes + 1);
      }
    } else {
      if (liked) {
        setLikes(likes + 1);
        setDislikes(dislikes - 1);
      } else {
        setLikes(likes - 1);
        setDislikes(dislikes + 1);
      }
    }
    
    setUserFeedback(liked);
  };

  return (
    <div className="flex items-center gap-4 py-8 border-t border-b">
      <p className="text-sm text-muted-foreground">Was this helpful?</p>
      <div className="flex gap-2">
        <Button
          variant={userFeedback === true ? "default" : "outline"}
          size="sm"
          onClick={() => handleFeedback(true)}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{likes}</span>
        </Button>
        <Button
          variant={userFeedback === false ? "default" : "outline"}
          size="sm"
          onClick={() => handleFeedback(false)}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{dislikes}</span>
        </Button>
      </div>
    </div>
  );
}
