"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { QuizBuilder } from "@/components/quiz-builder"

export default function PageEditorPage({ params }: { params: Promise<{ courseId: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageId = searchParams.get("pageId")
  const [courseId, setCourseId] = useState<string>("")

  const [pageTitle, setPageTitle] = useState("")
  const [contentType, setContentType] = useState<"ARTICLE" | "VIDEO" | "QUIZ">("ARTICLE")
  const [body, setBody] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [quizData, setQuizData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    params.then(p => setCourseId(p.courseId))
  }, [params])

  useEffect(() => {
    if (pageId && courseId) {
      fetchPage()
    }
  }, [pageId, courseId])

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/pages/${pageId}`)
      const data = await res.json()
      if (data) {
        setPageTitle(data.title)
        setContentType(data.contentType)
        setBody(data.body || "")
        setVideoUrl(data.videoUrl || "")
        setQuizData(data.quizData || [])
      }
    } catch (error) {
      console.error("Failed to fetch page:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const method = pageId ? "PUT" : "POST"
      const url = pageId
        ? `/api/admin/courses/${courseId}/pages/${pageId}`
        : `/api/admin/courses/${courseId}/pages`

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageTitle,
          contentType,
          body: contentType === "ARTICLE" || contentType === "VIDEO" ? body : undefined,
          videoUrl: contentType === "VIDEO" ? videoUrl : undefined,
          quizData: contentType === "QUIZ" ? quizData : undefined
        })
      })

      router.push(`/admin/courses/${courseId}`)
    } catch (error) {
      console.error("Failed to save page:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/courses/${courseId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {pageId ? "Edit Page" : "Create Page"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Enter page title..."
              />
            </div>

            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentType} onValueChange={(val: any) => setContentType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARTICLE">Article</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contentType === "VIDEO" && (
              <>
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="body">Additional Content (Markdown)</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Add markdown content to show below the video..."
                    rows={8}
                  />
                </div>
              </>
            )}

            {contentType === "ARTICLE" && (
              <div>
                <Label htmlFor="body">Content (Markdown)</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your article content here..."
                  rows={12}
                />
              </div>
            )}

            {contentType === "QUIZ" && (
              <div>
                <Label>Quiz Questions</Label>
                <QuizBuilder value={quizData} onChange={setQuizData} />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/courses/${courseId}`)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || !pageTitle}>
                {loading ? "Saving..." : pageId ? "Save Changes" : "Create Page"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
