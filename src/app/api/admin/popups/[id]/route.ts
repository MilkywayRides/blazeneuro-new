import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { popup } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const result = await db.query.popup.findFirst({
      where: eq(popup.id, id)
    })

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      popup: {
        ...result,
        components: JSON.parse(result.components)
      }
    })
  } catch (error) {
    console.error('Popup fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
