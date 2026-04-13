import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, session } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    
    // Verify with Google (simplified - in production use proper verification)
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
    const payload = await response.json()
    
    if (!payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Find or create user
    let existingUser = await db.query.user.findFirst({
      where: eq(user.email, payload.email)
    })

    if (!existingUser) {
      const [newUser] = await db.insert(user).values({
        id: crypto.randomUUID(),
        email: payload.email,
        name: payload.name || 'User',
        image: payload.picture,
        emailVerified: true,
        role: 'user'
      }).returning()
      existingUser = newUser
    }

    // Create session
    const sessionToken = crypto.randomUUID()
    await db.insert(session).values({
      id: crypto.randomUUID(),
      userId: existingUser.id,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    const response2 = NextResponse.json({
      token: sessionToken,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role
      }
    })

    response2.cookies.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return response2
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
