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

export function proxy(request: NextRequest) {
  const origin = request.headers.get('origin')
  
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
  response.headers.set('x-pathname', request.nextUrl.pathname)
  
  // Cache static assets
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|woff|woff2|ttf|eot)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Cache API responses
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
