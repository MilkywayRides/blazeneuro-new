"use client";

import { useState } from "react";
import { 
  Loader2, 
  RefreshCcw, 
  Video, 
  CheckCircle2, 
  XCircle,
  Coins
} from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipDisplay } from "@/components/auto-video/clip-display";
import { AutoVideoSettings } from "./settings-form";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AutoVideoPage() {
  const { data, error, mutate, isLoading } = useSWR("/api/admin/auto-video/data", fetcher, {
    refreshInterval: 5000 // Poll every 5 seconds for status updates
  });

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!youtubeUrl) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/admin/auto-video/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl })
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to start processing");

      setYoutubeUrl("");
      mutate(); // Refresh data

      toast.success("Processing started", {
        description: "Your video is being downloaded and processed.",
      });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An error occurred.";
      toast.error("Process failed", {
        description: message,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (error) return <div className="p-6 text-destructive">Failed to load data</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auto Video</h1>
          <p className="text-muted-foreground mt-1">
            Generate AI-powered podcast clips from YouTube.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full border">
          <Coins className="size-5 text-yellow-500" />
          <span className="font-bold">{data?.credits ?? 0} Credits</span>
          <Button variant="ghost" size="icon-sm" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCcw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="upload">YouTube URL & Tasks</TabsTrigger>
          <TabsTrigger value="clips">Generated Clips</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>New Podcast</CardTitle>
                  <CardDescription>
                    Enter a YouTube URL to extract highlights.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full p-2 border rounded-md bg-background"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      disabled={processing}
                    />
                  </div>
                  <Button 
                    onClick={handleProcess} 
                    className="w-full" 
                    disabled={!youtubeUrl || processing || (data?.credits ?? 0) <= 0}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Start Processing"
                    )}
                  </Button>
                  {(data?.credits ?? 0) <= 0 && (
                    <p className="text-xs text-center text-destructive font-medium">
                      Insufficient credits to start new tasks.
                    </p>
                  )}
                </CardContent>
              </Card>

              <AutoVideoSettings initialData={data?.userSettings} />
            </div>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>
                  Track the status of your video processing jobs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.files?.length > 0 ? (
                      data.files.map((file: any) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            <div className="flex items-center gap-2">
                              <Video className="size-4 text-muted-foreground" />
                              {file.displayName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              file.status === 'processed' ? 'default' : 
                              file.status === 'processing' ? 'secondary' : 
                              'destructive'
                            } className="capitalize">
                              {file.status === 'processing' && <Loader2 className="mr-1 size-3 animate-spin" />}
                              {file.status === 'processed' && <CheckCircle2 className="mr-1 size-3" />}
                              {file.status === 'failed' && <XCircle className="mr-1 size-3" />}
                              {file.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No tasks found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clips" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Clips</CardTitle>
              <CardDescription>
                Browse and download your AI-generated highlights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClipDisplay clips={data?.clips ?? []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
