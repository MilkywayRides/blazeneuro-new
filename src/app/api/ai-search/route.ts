import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

const MODAL_ENDPOINT = process.env.MODAL_SEARCH_ENDPOINT || '';
const BATCH_SIZE = 10;

export async function POST(req: NextRequest) {
  const { query, results } = await req.json();
  
  // Check cache for AI scores
  try {
    const cached = await db.execute(sql`
      SELECT result_id, ai_score 
      FROM ai_score_cache 
      WHERE LOWER(query) = LOWER(${query})
    `);
    
    if (cached.length > 0) {
      // Apply cached scores
      const scoreMap = new Map(cached.map((c: any) => [c.result_id, c.ai_score]));
      const rankedResults = results.map((r: any) => ({
        ...r,
        ai_score: scoreMap.get(r.id) || 0.5
      })).sort((a: any, b: any) => b.ai_score - a.ai_score);
      
      return NextResponse.json({ results: rankedResults, source: 'cache' });
    }
  } catch (error) {
    console.error('Cache lookup failed:', error);
  }
  
  // No cache, return unranked
  return NextResponse.json({ results, source: 'none' });
}

export async function PUT(req: NextRequest) {
  try {
    const { query, resultId, title, description, clicked, position, aiScore } = await req.json();

    await db.execute(sql`
      INSERT INTO search_interactions (query, result_id, result_title, result_description, clicked, position, ai_score)
      VALUES (${query}, ${resultId}, ${title}, ${description || ''}, ${clicked}, ${position}, ${aiScore || 0})
    `);

    // Count untrained interactions
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM search_interactions 
      WHERE ai_score = 0
    `);
    const untrainedCount = (countResult as any)[0]?.cnt || 0;

    // If we have 10 untrained, trigger training
    if (untrainedCount >= BATCH_SIZE && MODAL_ENDPOINT) {
      // Get batch for training
      const batch = await db.execute(sql`
        SELECT query, result_id, result_title as title, result_description as description, clicked::int as clicked
        FROM search_interactions
        WHERE ai_score = 0
        ORDER BY created_at DESC
        LIMIT ${BATCH_SIZE}
      `);

      // Train model
      try {
        await fetch(`${MODAL_ENDPOINT}/train_model`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            batch: (batch as any[]).map((r: any) => ({
              query: r.query,
              result: { title: r.title, description: r.description },
              clicked: r.clicked
            }))
          })
        });

        // Get AI scores for all queries in batch
        const uniqueQueries = [...new Set((batch as any[]).map((r: any) => r.query))];
        
        for (const q of uniqueQueries) {
          const queryResults = (batch as any[])
            .filter((r: any) => r.query === q)
            .map((r: any) => ({
              id: r.result_id,
              title: r.title,
              description: r.description
            }));

          const ranked = await fetch(`${MODAL_ENDPOINT}/rank_results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q, results: queryResults })
          }).then(r => r.json());

          // Cache scores
          for (const result of ranked) {
            await db.execute(sql`
              INSERT INTO ai_score_cache (query, result_id, ai_score)
              VALUES (${q}, ${result.id}, ${result.ai_score})
              ON CONFLICT (query, result_id) 
              DO UPDATE SET ai_score = ${result.ai_score}, trained_at = CURRENT_TIMESTAMP
            `);
          }
        }

        // Mark interactions as trained
        await db.execute(sql`
          UPDATE search_interactions 
          SET ai_score = 1 
          WHERE ai_score = 0 
          AND id IN (
            SELECT id FROM search_interactions WHERE ai_score = 0 ORDER BY created_at DESC LIMIT ${BATCH_SIZE}
          )
        `);

        return NextResponse.json({ 
          success: true, 
          trained: true,
          message: 'Batch trained and cached!'
        });
      } catch (error) {
        console.error('Training failed:', error);
      }
    }

    return NextResponse.json({ 
      success: true,
      untrained: untrainedCount,
      remaining: BATCH_SIZE - untrainedCount
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
}
