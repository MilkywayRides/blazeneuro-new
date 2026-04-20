"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function BlogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs')
        if (res.ok) {
          const data = await res.json()
          setBlogs(data)
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchBlogs()
    }
  }, [session])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Blogs</h1>
        </header>
        <div className="flex-1 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {blogs.length === 0 ? (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>No blogs yet</CardTitle>
                  <CardDescription>
                    Create your first blog using the CLI tool
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="text-sm bg-muted p-2 rounded">
                    python fastapi/cli.py
                  </code>
                </CardContent>
              </Card>
            ) : (
              blogs.map((blog: any) => (
                <Card key={blog.id}>
                  <CardHeader>
                    <CardTitle>{blog.topic}</CardTitle>
                    <CardDescription>
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/blog/${blog.id}`}>View</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/data-flow?blogId=${blog.id}`}>Edit Flow</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
