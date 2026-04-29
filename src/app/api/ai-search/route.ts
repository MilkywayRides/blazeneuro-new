import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

const MODAL_ENDPOINT = process.env.MODAL_SEARCH_ENDPOINT || '';
const BATCH_SIZE = 10;

export async function POST(req: NextRequest) {
  const { query, results } = await req.json();
  
  // Get AI rankings if we have enough data
  const countResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM search_interactions`);
  const count = (countResult as any)[0]?.cnt || 0;
  
  if (count >= BATCH_SIZE && MODAL_ENDPOINT) {
    try {
      const ranked = await fetch(`${MODAL_ENDPOINT}/rank_results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, results })
      }).then(r => r.json());
      
      return NextResponse.json({ results: ranked, aiEnabled: true });
    } catch (error) {
      console.error('AI ranking failed:', error);
    }
  }
  
  // Return unranked results
  return NextResponse.json({ results, aiEnabled: false });
}

export async function PUT(req: NextRequest) {
  try {
    const { query, resultId, title, description, clicked, position, aiScore } = await req.json();

    await db.execute(sql`
      INSERT INTO search_interactions (query, result_id, result_title, result_description, clicked, position, ai_score)
      VALUES (${query}, ${resultId}, ${title}, ${description || ''}, ${clicked}, ${position}, ${aiScore || 0})
    `);

    const countResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM search_interactions`);
    const count = (countResult as any)[0]?.cnt || 0;

    return NextResponse.json({ 
      success: true, 
      collected: count,
      remaining: Math.max(0, BATCH_SIZE - count),
      aiReady: count >= BATCH_SIZE
    });
  } catch (error) {
    console.error('Error saving interaction:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error),
      collected: 0,
      remaining: BATCH_SIZE
    }, { status: 500 });
  }
}
