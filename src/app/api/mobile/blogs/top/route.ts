import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blog, user } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const topBlogs = await db
      .select({
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt,
        coverImage: blog.coverImage,
        likeCount: blog.likeCount,
        authorName: user.name,
        authorImage: user.image
      })
      .from(blog)
      .leftJoin(user, eq(blog.authorId, user.id))
      .where(eq(blog.published, true))
      .orderBy(desc(blog.likeCount))
      .limit(5);

    return NextResponse.json({ blogs: topBlogs });
  } catch (error) {
    console.error('Get top blogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch top blogs' }, { status: 500 });
  }
}
