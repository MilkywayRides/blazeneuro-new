import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Add likeCount and dislikeCount columns
    await db.execute(sql`
      ALTER TABLE "blog" ADD COLUMN IF NOT EXISTS "likeCount" integer DEFAULT 0 NOT NULL;
    `);
    
    await db.execute(sql`
      ALTER TABLE "blog" ADD COLUMN IF NOT EXISTS "dislikeCount" integer DEFAULT 0 NOT NULL;
    `);
    
    // Update existing blogs
    await db.execute(sql`
      UPDATE "blog" SET "likeCount" = 0, "dislikeCount" = 0 
      WHERE "likeCount" IS NULL OR "dislikeCount" IS NULL;
    `);

    return NextResponse.json({ success: true, message: 'Migration completed' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
  }
}
