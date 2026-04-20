import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogs } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const allBlogs = await db.select().from(blogs).orderBy(desc(blogs.createdAt))
    return NextResponse.json(allBlogs)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
  }
}
