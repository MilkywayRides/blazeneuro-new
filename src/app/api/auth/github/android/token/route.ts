import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, session } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { code, state } = await req.json()
    
    // Exchange code for GitHub access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    })

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 401 })
    }

    // Get GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })
    const githubUser = await userResponse.json()

    // Get user email
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })
    const emails = await emailResponse.json()
    const primaryEmail = emails.find((e: any) => e.primary)?.email || githubUser.email

    if (!primaryEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 401 })
    }

    // Find or create user
    let existingUser = await db.query.user.findFirst({
      where: eq(user.email, primaryEmail)
    })

    if (!existingUser) {
      const [newUser] = await db.insert(user).values({
        id: crypto.randomUUID(),
        email: primaryEmail,
        name: githubUser.name || githubUser.login,
        image: githubUser.avatar_url,
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

    const response = NextResponse.json({
      token: sessionToken,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role
      }
    })

    response.cookies.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error('GitHub auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
