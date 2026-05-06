import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ 
        error: 'No session found',
        cookies: req.cookies.getAll().map(c => c.name)
      }, { status: 401 })
    }

    return NextResponse.json({
      user: session.user,
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
