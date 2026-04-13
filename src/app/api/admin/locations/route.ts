import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deviceLocation } from '@/lib/schema'
import { gte, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('better-auth.session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await db.query.session.findFirst({
      where: (s, { eq }) => eq(s.token, sessionToken)
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.userId)
    })

    if (!userRecord || userRecord.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const locations = await db.query.deviceLocation.findMany({
      where: gte(deviceLocation.lastSeen, fiveMinutesAgo)
    })

    return NextResponse.json({ locations })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
