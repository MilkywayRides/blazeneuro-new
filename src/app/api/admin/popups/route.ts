import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const POPUPS_FILE = path.join(DATA_DIR, 'popups.json')

export async function POST(req: NextRequest) {
  try {
    const { title, components } = await req.json()
    
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true })
    }

    let popups = []
    if (existsSync(POPUPS_FILE)) {
      const data = await readFile(POPUPS_FILE, 'utf-8')
      popups = JSON.parse(data)
    }

    const newPopup = {
      id: crypto.randomUUID(),
      title,
      components,
      active: true,
      createdAt: new Date().toISOString()
    }

    popups.push(newPopup)
    await writeFile(POPUPS_FILE, JSON.stringify(popups, null, 2))

    return NextResponse.json({ success: true, id: newPopup.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!existsSync(POPUPS_FILE)) {
      return NextResponse.json({ popups: [] })
    }

    const data = await readFile(POPUPS_FILE, 'utf-8')
    const popups = JSON.parse(data)

    return NextResponse.json({ popups })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
