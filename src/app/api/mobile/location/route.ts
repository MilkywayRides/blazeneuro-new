import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deviceLocation } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const SECRET = process.env.LOCATION_SECRET || 'change-this-secret'

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

    const existing = await db.query.deviceLocation.findFirst({
      where: eq(deviceLocation.deviceId, deviceId)
    })

    if (existing) {
      await db.update(deviceLocation)
        .set({ latitude, longitude, userId, lastSeen: new Date() })
        .where(eq(deviceLocation.deviceId, deviceId))
    } else {
      await db.insert(deviceLocation).values({
        id: crypto.randomUUID(),
        deviceId,
        latitude,
        longitude,
        userId,
        lastSeen: new Date()
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
