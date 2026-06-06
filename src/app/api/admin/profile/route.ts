import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { user } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.user.id)
    })

    return NextResponse.json(userRecord)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username, bio, name } = await req.json()

    // Validate username if provided
    if (username) {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return NextResponse.json({ error: 'Username must be 3-20 characters and only contain letters, numbers, and underscores.' }, { status: 400 })
      }

      // Check if username is taken by another user
      const existing = await db.query.user.findFirst({
        where: (u, { eq, and, ne }) => and(
          eq(u.username, username),
          ne(u.id, session.user.id)
        )
      })

      if (existing) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 400 })
      }
    }

    const [updatedUser] = await db
      .update(user)
      .set({ 
        username: username || null, 
        bio: bio || null,
        name: name || session.user.name,
        updatedAt: new Date()
      })
      .where(eq(user.id, session.user.id))
      .returning()

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
