import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Extract subdomain, assuming the base domain is blazeneuro.com
  // In local development, you might test with subdomain.localhost:3000
  let currentHost = hostname;
  if (hostname.includes('blazeneuro.com')) {
    currentHost = hostname.replace('.blazeneuro.com', '');
  } else if (hostname.includes('localhost')) {
    currentHost = hostname.replace('.localhost:3000', '').replace(':3000', '');
  }

  // Skip middleware for main domain, admin, www, and API routes
  if (
    currentHost !== hostname && 
    currentHost !== 'www' && 
    currentHost !== 'admin' &&
    currentHost !== 'localhost' &&
    !url.pathname.startsWith('/api') &&
    !url.pathname.startsWith('/_next')
  ) {
    try {
      // Fetch the target URL (Sandbox URL) for this subdomain
      const targetRes = await fetch(`${url.origin}/api/projects/get-target-url?subdomain=${currentHost}`);
      const data = await targetRes.json();
      
      if (data.targetUrl) {
        // Rewrite the request to the Sandbox URL
        return NextResponse.rewrite(new URL(`${data.targetUrl}${url.pathname}${url.search}`));
      }
    } catch (err) {
      console.error('Subdomain routing error:', err);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
