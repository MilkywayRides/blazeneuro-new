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
import { Trash2, Pencil, GripVertical } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  order: number
}

type Course = {
  id: string
  title: string
  type: "FREE" | "PAID"
  pages: Page[]
}

function SortableRow({ page, onEdit, onDelete }: { page: Page, onEdit: (page: Page) => void, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>
      <TableCell>{page.order + 1}</TableCell>
      <TableCell className="font-medium">{page.title}</TableCell>
      <TableCell>
        <Badge variant="outline">{page.contentType}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(page)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(page.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function CourseBuilderPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [pageTitle, setPageTitle] = useState("")
  const [contentType, setContentType] = useState<"ARTICLE" | "VIDEO" | "QUIZ">("ARTICLE")
  const [body, setBody] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
    if (editingPage) {
      await fetch(`/api/admin/courses/${courseId}/pages/${editingPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageTitle,
          contentType,
          body: contentType === "ARTICLE" ? body : undefined,
          videoUrl: contentType === "VIDEO" ? videoUrl : undefined
        })
      })
    } else {
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
    }
    setLoading(false)
    setDialogOpen(false)
    setEditingPage(null)
    setPageTitle("")
    setBody("")
    setVideoUrl("")
    fetchCourse()
  }

  const handleEditPage = (page: Page) => {
    setEditingPage(page)
    setPageTitle(page.title)
    setContentType(page.contentType)
    setBody(page.body || "")
    setVideoUrl(page.videoUrl || "")
    setDialogOpen(true)
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return
    await fetch(`/api/admin/courses/${courseId}/pages/${pageId}`, {
      method: "DELETE"
    })
    fetchCourse()
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id || !course) return

    const oldIndex = course.pages.findIndex(p => p.id === active.id)
    const newIndex = course.pages.findIndex(p => p.id === over.id)

    const newPages = arrayMove(course.pages, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }))
    setCourse({ ...course, pages: newPages })

    await fetch(`/api/admin/courses/${courseId}/pages/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages: newPages.map(p => ({ id: p.id, order: p.order })) })
    })
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Content Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext items={course.pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {course.pages.map((page) => (
                      <SortableRow key={page.id} page={page} onEdit={handleEditPage} onDelete={handleDeletePage} />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setEditingPage(null)
          setPageTitle("")
          setBody("")
          setVideoUrl("")
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Edit Page" : "Add Page"}</DialogTitle>
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
            <Button onClick={handleAddPage} disabled={loading || !pageTitle}>
              {editingPage ? "Save Changes" : "Add Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
