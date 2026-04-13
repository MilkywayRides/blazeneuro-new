import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { popup } from '@/lib/schema'

export async function POST(req: NextRequest) {
  try {
    const { title, components } = await req.json()
    
    const id = crypto.randomUUID()
    
    try {
      await db.insert(popup).values({
        id,
        title,
        components: JSON.stringify(components),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return NextResponse.json({ success: true, id })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: 'Database table not found. Please run migration first.',
        details: dbError instanceof Error ? dbError.message : 'Unknown'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Popup save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const popups = await db.query.popup.findMany({
      orderBy: (popup, { desc }) => [desc(popup.createdAt)]
    })

    return NextResponse.json({ 
      popups: popups.map(p => ({
        ...p,
        components: JSON.parse(p.components)
      }))
    })
  } catch (error) {
    console.error('Popup fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
