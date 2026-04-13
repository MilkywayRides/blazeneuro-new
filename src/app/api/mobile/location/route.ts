import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const SECRET = process.env.LOCATION_SECRET || 'Yh9XqIfuM3LBipxcSVPYLUSqve3p3pEE8qwhNhYAU0Y='
const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'locations.json')

interface LocationData {
  deviceId: string
  latitude: string
  longitude: string
  userId?: string
  lastSeen: string
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deviceId, latitude, longitude, userId } = await req.json()

    if (!deviceId || !latitude || !longitude) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true })
    }

    // Read existing data
    let locations: LocationData[] = []
    if (existsSync(DATA_FILE)) {
      const data = await readFile(DATA_FILE, 'utf-8')
      locations = JSON.parse(data)
    }

    // Update or add location
    const index = locations.findIndex(l => l.deviceId === deviceId)
    const newLocation: LocationData = {
      deviceId,
      latitude,
      longitude,
      userId: userId || undefined,
      lastSeen: new Date().toISOString()
    }

    if (index >= 0) {
      locations[index] = newLocation
    } else {
      locations.push(newLocation)
    }

    // Write back
    await writeFile(DATA_FILE, JSON.stringify(locations, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Location API error:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown' 
    }, { status: 500 })
  }
}
