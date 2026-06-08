"use client";

import { Download, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Clip {
  id: string;
  s3Key: string;
  createdAt: Date;
}

function ClipCard({ clip }: { clip: Clip }) {
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);

  useEffect(() => {
    async function fetchPlayUrl() {
      try {
        const res = await fetch(`/api/admin/auto-video/clips/${clip.id}/url`)
        const result = await res.json()
        if (result.success && result.url) {
          setPlayUrl(result.url);
        } else if (result.error) {
          console.error("Failed to get play url: " + result.error);
        }
      } catch (error) {
        console.error("Error fetching play URL:", error);
      } finally {
        setIsLoadingUrl(false);
      }
    }

    void fetchPlayUrl();
  }, [clip.id]);

  const handleDownload = () => {
    if (playUrl) {
      const link = document.createElement("a");
      link.href = playUrl;
      link.download = `clip-${clip.id}.mp4`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 border rounded-lg bg-card shadow-sm">
      <div className="aspect-[9/16] bg-muted rounded-md overflow-hidden relative">
        {isLoadingUrl ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : playUrl ? (
          <video
            src={playUrl}
            controls
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="text-muted-foreground h-10 w-10 opacity-50" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleDownload} variant="outline" size="sm" className="w-full">
          <Download className="mr-1.5 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}

export function ClipDisplay({ clips }: { clips: Clip[] }) {
  if (clips.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No clips generated yet.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} />
      ))}
    </div>
  );
}
