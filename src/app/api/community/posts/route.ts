import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communityPost, user } from '@/lib/schema'
import { eq, desc, isNull, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET(req: NextRequest) {
  try {
    const posts = await db
      .select({
        id: communityPost.id,
        message: communityPost.message,
        likes: communityPost.likes,
        dislikes: communityPost.dislikes,
        replyToId: communityPost.replyToId,
        createdAt: communityPost.createdAt,
        userId: communityPost.userId,
        userName: user.name,
      })
      .from(communityPost)
      .leftJoin(user, eq(communityPost.userId, user.id))
      .where(isNull(communityPost.replyToId))
      .orderBy(desc(communityPost.createdAt))
      .limit(50)

    const postIds = posts.map(p => p.id)
    
    const replies = postIds.length > 0 ? await db
      .select({
        id: communityPost.id,
        message: communityPost.message,
        likes: communityPost.likes,
        dislikes: communityPost.dislikes,
        replyToId: communityPost.replyToId,
        createdAt: communityPost.createdAt,
        userId: communityPost.userId,
        userName: user.name,
      })
      .from(communityPost)
      .leftJoin(user, eq(communityPost.userId, user.id))
      .where(inArray(communityPost.replyToId, postIds))
      .orderBy(communityPost.createdAt) : []

    const postsWithReplies = posts.map(post => ({
      ...post,
      replies: replies.filter(r => r.replyToId === post.id)
    }))

    return NextResponse.json(postsWithReplies)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, message, replyToId } = body

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [newPost] = await db.insert(communityPost).values({
      id: nanoid(),
      userId,
      message,
      replyToId: replyToId || null,
      likes: 0,
      dislikes: 0,
    }).returning()

    const [postWithUser] = await db
      .select({
        id: communityPost.id,
        message: communityPost.message,
        likes: communityPost.likes,
        dislikes: communityPost.dislikes,
        replyToId: communityPost.replyToId,
        createdAt: communityPost.createdAt,
        userId: communityPost.userId,
        userName: user.name,
      })
      .from(communityPost)
      .leftJoin(user, eq(communityPost.userId, user.id))
      .where(eq(communityPost.id, newPost.id))

    return NextResponse.json(postWithUser)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
