import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Use the standard NextAuth callback URL that's already registered
  const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || 'sbstylehub://callback';
  
  const authUrl = new URL('https://auth.blazeneuro.com/oauth/v1/authorize');
  authUrl.searchParams.set('client_id', process.env.BLAZENEURO_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', `http://10.55.14.40:3000/api/auth/callback/mobile`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', Buffer.from(callbackUrl).toString('base64'));
  
  return NextResponse.json({ authUrl: authUrl.toString() });
}
