"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useParams } from "next/navigation"
import { Trash2 } from "lucide-react"

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  order: number
}

type Course = {
  id: string
  title: string
  type: "FREE" | "PAID"
  pages: Page[]
}

export default function CourseBuilderPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState("")
  const [contentType, setContentType] = useState<"ARTICLE" | "VIDEO" | "QUIZ">("ARTICLE")
  const [body, setBody] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`)
      const data = await res.json()
      if (data.error) {
        console.error("Error fetching course:", data.error)
      } else {
        setCourse(data)
      }
    } catch (error) {
      console.error("Failed to fetch course:", error)
    }
  }

  const handleAddPage = async () => {
    setLoading(true)
    await fetch(`/api/admin/courses/${courseId}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pageTitle,
        contentType,
        body: contentType === "ARTICLE" ? body : undefined,
        videoUrl: contentType === "VIDEO" ? videoUrl : undefined
      })
    })
    setLoading(false)
    setDialogOpen(false)
    setPageTitle("")
    setBody("")
    setVideoUrl("")
    fetchCourse()
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return
    await fetch(`/api/admin/courses/${courseId}/pages/${pageId}`, {
      method: "DELETE"
    })
    fetchCourse()
  }

  if (!course) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{course.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={course.type === "FREE" ? "default" : "destructive"}>
                  {course.type}
                </Badge>
                <span className="text-sm text-muted-foreground">{course.pages?.length || 0} pages</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pages</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>+ Add Page</Button>
        </CardHeader>
        <CardContent>
          {!course.pages || course.pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pages yet. Add your first page to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Content Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>{page.order + 1}</TableCell>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{page.contentType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pageTitle">Page Title</Label>
              <Input
                id="pageTitle"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Introduction"
              />
            </div>
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                <SelectTrigger id="contentType">
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
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
            )}
            {contentType === "ARTICLE" && (
              <div>
                <Label htmlFor="body">Content</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your article content here..."
                  rows={8}
                />
              </div>
            )}
            {contentType === "QUIZ" && (
              <div>
                <Label htmlFor="quiz">Quiz Data</Label>
                <Textarea
                  id="quiz"
                  placeholder="Quiz builder coming soon — paste JSON or leave blank"
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPage} disabled={loading || !pageTitle}>Add Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
