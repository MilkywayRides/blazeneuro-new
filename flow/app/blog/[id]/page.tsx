import { db } from '@/lib/db'
import { blogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export default async function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [blog] = await db.select().from(blogs).where(eq(blogs.id, id))
  
  if (!blog) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <article className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">{blog.topic}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {new Date(blog.createdAt).toLocaleDateString()}
        </p>
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
          {blog.content}
        </div>
      </article>
    </div>
  )
}
