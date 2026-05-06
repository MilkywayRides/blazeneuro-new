"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useRouter } from "next/navigation"
import { Trash2, Pencil, GripVertical, Users } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  quizData?: any
  order: number
}

type EnrolledUser = {
  id: string
  name: string
  email: string
  enrolledAt: string
}

type Course = {
  id: string
  title: string
  type: "FREE" | "PAID"
  pages: Page[]
}

function SortableRow({ page, courseId, onDelete }: { page: Page, courseId: string, onDelete: (id: string) => void }) {
  const router = useRouter()
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
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/courses/${courseId}/page-editor?pageId=${page.id}`)}>
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
  const router = useRouter()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchCourse()
    fetchEnrolledUsers()
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

  const fetchEnrolledUsers = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/enrollments`)
      const data = await res.json()
      setEnrolledUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch enrollments:", error)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    setPageToDelete(pageId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!pageToDelete) return
    await fetch(`/api/admin/courses/${courseId}/pages/${pageToDelete}`, {
      method: "DELETE"
    })
    setDeleteDialogOpen(false)
    setPageToDelete(null)
    fetchCourse()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !course) return

    const oldIndex = course.pages.findIndex(p => p.id === active.id)
    const newIndex = course.pages.findIndex(p => p.id === over.id)

    const newPages = arrayMove(course.pages, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }))
    setCourse({ ...course, pages: newPages })

    try {
      await fetch(`/api/admin/courses/${courseId}/pages/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: newPages.map(p => ({ id: p.id, order: p.order })) })
      })
    } catch (error) {
      console.error("Failed to reorder:", error)
      fetchCourse()
    }
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

      <Tabs defaultValue="pages" className="w-full">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="enrolled">
            <Users className="h-4 w-4 mr-2" />
            Enrolled Users ({enrolledUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pages</CardTitle>
              <Button onClick={() => router.push(`/admin/courses/${courseId}/page-editor`)}>+ Add Page</Button>
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
                      <SortableRow key={page.id} page={page} courseId={courseId} onDelete={handleDeletePage} />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="enrolled">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Users</CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users enrolled yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrolled At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.enrolledAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
