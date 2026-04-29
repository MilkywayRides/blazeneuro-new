import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { query, resultId, title } = await req.json();
    
    await client`
      INSERT INTO search_interactions (query, result_id, result_title, result_description, clicked, position, ai_score)
      VALUES (${query}, ${resultId}, ${title}, '', true, 0, 0)
    `;
    
    const result = await client`SELECT COUNT(*) as count FROM search_interactions`;
    const count = parseInt(result[0].count);
    
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
