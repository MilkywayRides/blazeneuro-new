import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { db } from '@/lib/db'
import { communityPost, user } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

let io: SocketIOServer | null = null

export function initSocketServer(httpServer: HTTPServer) {
  if (io) return io

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    path: '/api/community/socket'
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('community:join', () => {
      socket.join('community')
      console.log('Client joined community room')
    })

    socket.on('community:new_post', async (data) => {
      try {
        const { userId, message, replyToId } = data

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

        io?.to('community').emit('community:post_created', postWithUser)
      } catch (error) {
        console.error('Error creating post:', error)
        socket.emit('community:error', { message: 'Failed to create post' })
      }
    })

    socket.on('community:like', async (data) => {
      try {
        const { postId, action } = data
        
        const field = action === 'like' ? 'likes' : 'dislikes'
        await db
          .update(communityPost)
          .set({ [field]: sql`${communityPost[field]} + 1` })
          .where(eq(communityPost.id, postId))

        const [updated] = await db
          .select()
          .from(communityPost)
          .where(eq(communityPost.id, postId))

        io?.to('community').emit('community:post_updated', updated)
      } catch (error) {
        console.error('Error updating post:', error)
        socket.emit('community:error', { message: 'Failed to update post' })
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export function getSocketServer() {
  return io
}
