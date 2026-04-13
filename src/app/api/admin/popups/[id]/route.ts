import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const POPUPS_FILE = path.join(process.cwd(), 'data', 'popups.json')

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    if (!existsSync(POPUPS_FILE)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const data = await readFile(POPUPS_FILE, 'utf-8')
    const popups = JSON.parse(data)
    const popup = popups.find((p: any) => p.id === id)

    if (!popup) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ popup })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
