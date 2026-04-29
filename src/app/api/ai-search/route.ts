import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

const MODAL_ENDPOINT = process.env.MODAL_SEARCH_ENDPOINT || '';
const BATCH_SIZE = 10;

export async function POST(req: NextRequest) {
  const { query, results } = await req.json();

  // Get AI rankings
  const ranked = await fetch(`${MODAL_ENDPOINT}/rank_results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, results })
  }).then(r => r.json());

  return NextResponse.json({ results: ranked });
}

export async function PUT(req: NextRequest) {
  const { query, resultId, title, description, clicked, position, aiScore } = await req.json();

  await db.execute(sql`
    INSERT INTO search_interactions (query, result_id, result_title, result_description, clicked, position, ai_score)
    VALUES (${query}, ${resultId}, ${title}, ${description}, ${clicked}, ${position}, ${aiScore})
  `);

  // Check if we have 10 interactions, then train
  const count = await db.execute(sql`
    SELECT COUNT(*) as cnt FROM search_interactions WHERE created_at > NOW() - INTERVAL '1 hour'
  `);

  if (count.rows[0].cnt >= BATCH_SIZE) {
    const batch = await db.execute(sql`
      SELECT query, result_id, result_title as title, result_description as description, clicked::int as clicked
      FROM search_interactions
      ORDER BY created_at DESC
      LIMIT ${BATCH_SIZE}
    `);

    await fetch(`${MODAL_ENDPOINT}/train_model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        batch: batch.rows.map(r => ({
          query: r.query,
          result: { title: r.title, description: r.description },
          clicked: r.clicked
        }))
      })
    });

    await db.execute(sql`DELETE FROM search_interactions WHERE id IN (
      SELECT id FROM search_interactions ORDER BY created_at DESC LIMIT ${BATCH_SIZE}
    )`);
  }

  return NextResponse.json({ success: true });
}
