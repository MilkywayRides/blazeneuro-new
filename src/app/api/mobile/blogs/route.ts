import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { blog } from "@/lib/schema"
import { desc, sql } from "drizzle-orm"

export const dynamic = 'force-dynamic'

const RATE_LIMIT = 100
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

  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
    const offset = parseInt(searchParams.get("offset") || "0")

    const blogList = await db
      .select({
        id: blog.id,
        title: blog.title,
        description: blog.excerpt,
        slug: blog.slug,
        createdAt: blog.createdAt,
        readTime: sql<number>`5`
      })
      .from(blog)
      .orderBy(desc(blog.createdAt))
      .limit(limit)
      .offset(offset)

    const response = NextResponse.json({ 
      blogs: blogList || [],
      count: blogList?.length || 0,
      hasMore: (blogList?.length || 0) === limit
    })
    
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    return response
  } catch (error: any) {
    console.error("Blogs API error:", error?.message || error)
    return NextResponse.json({ 
      blogs: [],
      count: 0,
      hasMore: false
    })
  }
}
