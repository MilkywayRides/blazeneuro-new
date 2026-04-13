import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { popup } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    try {
      const result = await db.query.popup.findFirst({
        where: eq(popup.active, true),
        orderBy: (popup, { desc }) => [desc(popup.createdAt)]
      })

      return NextResponse.json({ 
        popup: result ? {
          ...result,
          components: JSON.parse(result.components)
        } : null
      })
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Return null if table doesn't exist
      return NextResponse.json({ popup: null })
    }
  } catch (error) {
    console.error('Popup fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
