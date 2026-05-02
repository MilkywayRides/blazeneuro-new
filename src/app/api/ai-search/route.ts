import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const MODAL_ENDPOINT = process.env.MODAL_SEARCH_ENDPOINT || '';
const BATCH_SIZE = 10;

export async function POST(req: NextRequest) {
  const { query, results } = await req.json();

  // 1. Check cache for AI scores (existing behavior)
  try {
    const cached = await db.execute(sql`
      SELECT result_id, ai_score
      FROM ai_score_cache
      WHERE LOWER(query) = LOWER(${query})
    `);

    if (cached.length > 0) {
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

  // 2. Text-match search in blogs
  try {
    const normalizedQuery = query.toLowerCase().trim();

    if (normalizedQuery) {
      const matchedBlogs = await db.execute(sql`
        SELECT id, title, excerpt, content
        FROM blog
        WHERE LOWER(title) LIKE ${'%' + normalizedQuery + '%'}
           OR LOWER(content) LIKE ${'%' + normalizedQuery + '%'}
           OR LOWER(excerpt) LIKE ${'%' + normalizedQuery + '%'}
        ORDER BY "createdAt" DESC
        LIMIT 20
      `);

      if ((matchedBlogs as any[]).length > 0) {
        // We have text matches — show them in learning mode
        const formattedBlogs = (matchedBlogs as any[]).map((b: any) => ({
          id: b.id,
          title: b.title,
          excerpt: b.excerpt,
          content: b.content,
          ai_score: 0.5
        }));

        return NextResponse.json({
          results: formattedBlogs,
          source: 'learning',
          message: 'Click what you find relevant to teach the AI!'
        });
      }
    }

    // 3. No text matches — check user contributions
    const contributions = await db.execute(sql`
      SELECT id, query, title, description, links, tags, upvotes, created_at
      FROM user_contribution
      WHERE LOWER(query) LIKE ${'%' + (normalizedQuery || '') + '%'}
         OR LOWER(title) LIKE ${'%' + (normalizedQuery || '') + '%'}
         OR LOWER(description) LIKE ${'%' + (normalizedQuery || '') + '%'}
      ORDER BY upvotes DESC, created_at DESC
      LIMIT 10
    `);

    if ((contributions as any[]).length > 0) {
      return NextResponse.json({
        results: [],
        contributions: (contributions as any[]).map((c: any) => ({
          id: c.id,
          query: c.query,
          title: c.title,
          description: c.description,
          links: c.links,
          tags: c.tags,
          upvotes: c.upvotes,
          createdAt: c.created_at
        })),
        source: 'contributions',
        message: 'No blog posts found, but users have contributed knowledge about this topic!'
      });
    }

    // 4. Truly no results at all
    return NextResponse.json({
      results: [],
      contributions: [],
      source: 'none',
      noResults: true,
      message: 'No results found'
    });

  } catch (error) {
    console.error('Search error:', error);
  }

  // Fallback
  return NextResponse.json({ results, source: 'none' });
}

// PATCH — Submit a user contribution
export async function PATCH(req: NextRequest) {
  try {
    const { query, title, description, links, tags } = await req.json();

    // Validate input
    if (!query || !title || !description) {
      return NextResponse.json({
        success: false,
        error: 'Query, title, and description are required'
      }, { status: 400 });
    }

    if (title.length < 3 || description.length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Title must be at least 3 characters and description at least 10 characters'
      }, { status: 400 });
    }

    const id = randomUUID();
    const tagsArray = tags && tags.length > 0 ? tags : query.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);
    const tagsStr = `{${tagsArray.map((t: string) => `"${t.replace(/"/g, '\\"')}"`).join(',')}}`;

    await db.execute(sql`
      INSERT INTO user_contribution (id, query, title, description, links, tags)
      VALUES (${id}, ${query}, ${title}, ${description}, ${links || null}, ${tagsStr}::text[])
    `);

    return NextResponse.json({
      success: true,
      id,
      message: 'Thank you for your contribution! This will help future searchers.'
    });
  } catch (error) {
    console.error('Contribution error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}

// PUT — Track clicks and train AI (existing behavior preserved)
export async function PUT(req: NextRequest) {
  try {
    const { query, resultId, title, description, clicked, position, aiScore } = await req.json();

    // Always store new interaction (even if we have cached scores)
    await db.execute(sql`
      INSERT INTO search_interactions (query, result_id, result_title, result_description, clicked, position, ai_score)
      VALUES (${query}, ${resultId}, ${title}, ${description || ''}, ${clicked}, ${position}, 0)
    `);

    // Count ALL untrained interactions (not just recent ones)
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM search_interactions
      WHERE ai_score = 0
    `);
    const untrainedCount = (countResult as any)[0]?.cnt || 0;

    // If we have 10 untrained, trigger retraining
    if (untrainedCount >= BATCH_SIZE && MODAL_ENDPOINT) {
      // Get batch for training
      const batch = await db.execute(sql`
        SELECT query, result_id, result_title as title, result_description as description, clicked::int as clicked
        FROM search_interactions
        WHERE ai_score = 0
        ORDER BY created_at DESC
        LIMIT ${BATCH_SIZE}
      `);

      // Train model (this improves the model with new data)
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

        // Get updated AI scores for queries in this batch
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

          // Update cache with new scores (overwrites old scores)
          for (const result of ranked) {
            await db.execute(sql`
              INSERT INTO ai_score_cache (query, result_id, ai_score)
              VALUES (${q}, ${result.id}, ${result.ai_score})
              ON CONFLICT (query, result_id)
              DO UPDATE SET ai_score = ${result.ai_score}, trained_at = CURRENT_TIMESTAMP
            `);
          }
        }

        // Mark these interactions as trained
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
          message: 'Model retrained! Cache updated with improved scores.'
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
