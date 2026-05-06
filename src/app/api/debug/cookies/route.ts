import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const cookies = req.cookies.getAll()
  const headers = Object.fromEntries(req.headers.entries())
  
  return NextResponse.json({
    cookies: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
    headers: {
      cookie: headers.cookie?.substring(0, 100) + '...',
      origin: headers.origin,
      referer: headers.referer,
    },
    url: req.url,
  })
}
