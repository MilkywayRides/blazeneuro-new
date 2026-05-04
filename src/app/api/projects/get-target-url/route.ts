import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { project } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');
  if (!subdomain) return NextResponse.json({ error: 'Missing subdomain' }, { status: 400 });

  const proj = await db.query.project.findFirst({
    where: eq(project.subdomain, subdomain),
  });

  if (!proj || !proj.domain) {
    return NextResponse.json({ targetUrl: null });
  }

  return NextResponse.json({ targetUrl: proj.domain });
}
