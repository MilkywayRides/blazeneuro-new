import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const POPUPS_FILE = path.join(process.cwd(), 'data', 'popups.json')

export async function GET() {
  try {
    if (!existsSync(POPUPS_FILE)) {
      return NextResponse.json({ popup: null })
    }

    const data = await readFile(POPUPS_FILE, 'utf-8')
    const popups = JSON.parse(data)
    const activePopup = popups.find((p: any) => p.active)

    return NextResponse.json({ popup: activePopup || null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
