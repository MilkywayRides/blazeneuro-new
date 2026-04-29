import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

const BATCH_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const countResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM search_interactions`);
    const count = (countResult as any)[0]?.cnt || 0;
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(req: NextRequest) {
  const { query, results } = await req.json();
  
  // Just return results without AI ranking for now
  return NextResponse.json({ results });
}

export async function PUT(req: NextRequest) {
  try {
    const { query, resultId, title, description, clicked, position } = await req.json();

    console.log('Recording interaction:', { query, resultId, title });

    // Store user interaction
    await db.execute(sql`
      INSERT INTO search_interactions (query, result_id, result_title, result_description, clicked, position, ai_score)
      VALUES (${query}, ${resultId}, ${title}, ${description || ''}, ${clicked}, ${position}, 0)
    `);

    console.log('Interaction saved successfully');

    // Check how many interactions we have
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM search_interactions
    `);

    const count = (countResult as any)[0]?.cnt || 0;
    console.log('Total interactions:', count);

    return NextResponse.json({ 
      success: true, 
      collected: count,
      remaining: Math.max(0, BATCH_SIZE - count),
      message: count >= BATCH_SIZE ? 'Ready for AI training!' : `Collecting data: ${count}/${BATCH_SIZE}`
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
