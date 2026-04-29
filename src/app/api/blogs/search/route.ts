import { NextRequest, NextResponse } from 'next/server';
import { searchBlogs } from '@/lib/search';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || '';
  
  if (!query) {
    return NextResponse.json([]);
  }

  const results = await searchBlogs(query);
  return NextResponse.json(results);
}
