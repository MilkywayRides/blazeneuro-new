import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communityPost } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { action } = await req.json()

    if (action !== 'like' && action !== 'dislike') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const field = action === 'like' ? 'likes' : 'dislikes'
    
    await db
      .update(communityPost)
      .set({ [field]: sql`${communityPost[field]} + 1` })
      .where(eq(communityPost.id, id))

    const [updated] = await db
      .select()
      .from(communityPost)
      .where(eq(communityPost.id, id))

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}
