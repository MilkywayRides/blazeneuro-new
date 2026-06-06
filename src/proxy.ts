import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://local.blazeneuro.com:3001',
  'https://blazeneuro.com',
  'https://auth.blazeneuro.com',
  'https://www.blazeneuro.com'
]

export async function proxy(request: NextRequest) {
  const origin = request.headers.get('origin')
  const pathname = request.nextUrl.pathname
  const hostname = request.headers.get('host') || ''

  // --- Subdomain Routing for [project].blazeneuro.com ---
  let subdomain: string | null = null;
  if (hostname.endsWith('.blazeneuro.com')) {
    // Only matches subdomains like "myapp.blazeneuro.com", NOT "blazeneuro.com" itself
    const parts = hostname.replace('.blazeneuro.com', '');
    if (parts && parts !== 'www' && parts !== 'admin') {
      subdomain = parts;
    }
  } else if (hostname.includes('.localhost')) {
    // For local testing: "myapp.localhost:3000"
    const parts = hostname.split('.localhost')[0];
    if (parts && parts !== 'localhost' && !parts.includes(':')) {
      subdomain = parts;
    }
  }

  if (subdomain && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    try {
      const targetRes = await fetch(`${request.nextUrl.origin}/api/projects/get-target-url?subdomain=${subdomain}`);
      const data = await targetRes.json();
      if (data.targetUrl) {
        return NextResponse.rewrite(new URL(`${data.targetUrl}${pathname}${request.nextUrl.search}`));
      }
    } catch (err) {
      console.error('Subdomain routing error:', err);
    }
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 200 })
    if (origin && allowedOrigins.includes(origin)) {
      preflightResponse.headers.set('Access-Control-Allow-Origin', origin)
    }
    preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    preflightResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    preflightResponse.headers.set('Access-Control-Max-Age', '86400')
    return preflightResponse
  }
  
  const response = NextResponse.next();
  
  // CORS
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Add pathname for redirect tracking
  response.headers.set('x-pathname', pathname)
  
  // Cache static assets
  if (pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.startsWith('/_next/image')) {
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  } else if (pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|avif|woff|woff2|ttf|eot)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  }
  
  // Cache API responses
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
