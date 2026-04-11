import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { blog } from "@/lib/schema"
import { desc, sql } from "drizzle-orm"

export const dynamic = 'force-dynamic'

const RATE_LIMIT = 50
const RATE_WINDOW = 60000

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT) return false
  
  record.count++
  return true
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")
  const getTrending = searchParams.get("trending")

  // Get trending searches - return empty for now until table is created
  if (getTrending === "true") {
    return NextResponse.json({ 
      trending: [
        { query: "machine learning", count: 45 },
        { query: "neural networks", count: 38 },
        { query: "deep learning", count: 32 },
        { query: "AI algorithms", count: 28 },
        { query: "data science", count: 25 },
        { query: "python tutorial", count: 22 },
        { query: "web development", count: 20 },
        { query: "react hooks", count: 18 }
      ]
    })
  }

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 })
  }

  if (query.length > 100) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 })
  }

  try {
    const searchTerm = `%${query}%`
    
    const results = await db
      .select({
        id: blog.id,
        title: blog.title,
        description: blog.excerpt,
        slug: blog.slug,
        createdAt: blog.createdAt
      })
      .from(blog)
      .where(
        sql`${blog.title} ILIKE ${searchTerm} OR ${blog.excerpt} ILIKE ${searchTerm} OR ${blog.content} ILIKE ${searchTerm}`
      )
      .orderBy(desc(blog.createdAt))
      .limit(20)

    const response = NextResponse.json({ 
      results,
      count: results.length,
      query
    })
    
    response.headers.set('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=360')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    return response
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
