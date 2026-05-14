"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useRouter } from "next/navigation"
import { Trash2, Pencil, GripVertical, Users, Video, FileText, HelpCircle, Loader2 } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from "@/lib/utils"

type Page = {
  id: string
  title: string
  contentType: "ARTICLE" | "VIDEO" | "QUIZ"
  body?: string
  videoUrl?: string
  quizData?: unknown
  order: number
}

function SortableRow({ page, courseId, onDelete }: { page: Page, courseId: string, onDelete: (id: string) => void }) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Video className="h-4 w-4" />
      case "ARTICLE": return <FileText className="h-4 w-4" />
      case "QUIZ": return <HelpCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group transition-colors",
        isDragging && "bg-muted/50 z-50 relative shadow-lg"
      )}
    >
      <TableCell className="w-10">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>
      <TableCell className="w-16">
        <span className="text-xs font-black tabular-nums text-muted-foreground/60">
          {(page.order + 1).toString().padStart(2, '0')}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/5 text-primary">
            {getIcon(page.contentType)}
          </div>
          <span className="font-semibold text-sm tracking-tight">{page.title}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider px-2 py-0">
          {page.contentType}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => router.push(`/admin/courses/${courseId}/page-editor?pageId=${page.id}`)}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => onDelete(page.id)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
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
  const [isSaving, setIsSaving] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchCourse = useCallback(async () => {
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
  }, [courseId])

  const fetchEnrolledUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/enrollments`)
      const data = await res.json()
      setEnrolledUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch enrollments:", error)
    }
  }, [courseId])

  useEffect(() => {
    fetchCourse()
    fetchEnrolledUsers()
  }, [fetchCourse, fetchEnrolledUsers])

  const handleDeletePage = async (pageId: string) => {
    setPageToDelete(pageId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!pageToDelete) return
    setIsSaving(true)
    try {
      await fetch(`/api/admin/courses/${courseId}/pages/${pageToDelete}`, {
        method: "DELETE"
      })
      setDeleteDialogOpen(false)
      setPageToDelete(null)
      await fetchCourse()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !course) return

    const oldIndex = course.pages.findIndex(p => p.id === active.id)
    const newIndex = course.pages.findIndex(p => p.id === over.id)

    const newPages = arrayMove(course.pages, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }))
    setCourse({ ...course, pages: newPages })

    setIsSaving(true)
    try {
      await fetch(`/api/admin/courses/${courseId}/pages/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: newPages.map(p => ({ id: p.id, order: p.order })) })
      })
    } catch (error) {
      console.error("Failed to reorder:", error)
      fetchCourse()
    } finally {
      setIsSaving(false)
    }
  }

  if (!course) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary/20" /></div>

  return (
    <div className="p-6 space-y-6 relative">
      {isSaving && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-[2px] transition-all">
          <Card className="shadow-2xl border-primary/20 ring-1 ring-primary/10">
            <CardContent className="py-6 px-8 flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="font-bold tracking-tight">Syncing changes...</span>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight">{course.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={course.type === "FREE" ? "secondary" : "destructive"} className="font-black text-[10px] uppercase px-2 py-0.5">
                  {course.type} Access
                </Badge>
                <div className="h-1 w-1 rounded-full bg-border" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{course.pages?.length || 0} Modules</span>
              </div>
            </div>
            <Button onClick={() => router.push(`/admin/courses/${courseId}/page-editor`)} className="font-bold gap-2">
              <Pencil className="h-4 w-4" />
              Build Module
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="pages" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Modules</TabsTrigger>
          <TabsTrigger value="enrolled" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="h-4 w-4 mr-2" />
            Enrollments
            <Badge variant="secondary" className="ml-2 h-5 min-w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
              {enrolledUsers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {!course.pages || course.pages.length === 0 ? (
                <div className="text-center py-20 bg-muted/20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-background shadow-inner">
                      <FileText className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-foreground/80">No modules found</p>
                      <p className="text-sm text-muted-foreground">Start by adding your first educational module.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-16 text-[10px] uppercase font-black tracking-widest">Rank</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-foreground">Content Title</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest">Format</TableHead>
                        <TableHead className="text-right text-[10px] uppercase font-black tracking-widest pr-6">Management</TableHead>
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

        <TabsContent value="enrolled" className="mt-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {enrolledUsers.length === 0 ? (
                <div className="text-center py-20 bg-muted/20">
                   <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-background shadow-inner">
                      <Users className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-foreground/80">Zero enrollments</p>
                      <p className="text-sm text-muted-foreground">Waiting for your first student to join.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-[10px] uppercase font-black tracking-widest text-foreground">Student Name</TableHead>
                      <TableHead className="text-[10px] uppercase font-black tracking-widest">Contact Email</TableHead>
                      <TableHead className="text-[10px] uppercase font-black tracking-widest">Enrollment Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledUsers.map((user) => (
                      <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="font-bold text-sm tracking-tight">{user.name}</TableCell>
                        <TableCell className="text-sm font-medium text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="text-sm font-black tabular-nums text-muted-foreground/60">{new Date(user.enrolledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
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
