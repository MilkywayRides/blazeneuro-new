import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { flows } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { userId, name, nodes, edges } = await request.json()

    const [flow] = await db.insert(flows).values({
      userId,
      name: name || 'Untitled Flow',
      nodes,
      edges,
    }).returning()

    return NextResponse.json(flow)
  } catch (error) {
    console.error('Error saving flow:', error)
    return NextResponse.json({ error: 'Failed to save flow' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const userFlows = await db.select().from(flows).where(eq(flows.userId, userId))

    return NextResponse.json(userFlows)
  } catch (error) {
    console.error('Error fetching flows:', error)
    return NextResponse.json({ error: 'Failed to fetch flows' }, { status: 500 })
  }
}
