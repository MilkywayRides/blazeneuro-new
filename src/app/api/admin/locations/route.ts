import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { db } from '@/lib/db'

const DATA_FILE = path.join(process.cwd(), 'data', 'locations.json')

interface LocationData {
  deviceId: string
  latitude: string
  longitude: string
  userId?: string
  lastSeen: string
}

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

    // Read from JSON file
    if (!existsSync(DATA_FILE)) {
      return NextResponse.json({ locations: [] })
    }

    const data = await readFile(DATA_FILE, 'utf-8')
    const allLocations: LocationData[] = JSON.parse(data)

    // Filter locations from last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const locations = allLocations.filter(loc => 
      new Date(loc.lastSeen) > fiveMinutesAgo
    )

    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Get locations error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
