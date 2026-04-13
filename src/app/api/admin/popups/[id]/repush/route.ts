import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { popup } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Set all popups to inactive
    await db.update(popup).set({ active: false })
    
    // Set this popup to active
    await db.update(popup).set({ active: true }).where(eq(popup.id, id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to repush' }, { status: 500 })
  }
}
