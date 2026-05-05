import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  
  let redirectUrl = 'sbstylehub://callback';
  if (state) {
    try {
      redirectUrl = Buffer.from(state, 'base64').toString('utf-8');
    } catch {}
  }
  
  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://auth.blazeneuro.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `http://10.55.14.40:3000/api/auth/callback/mobile`,
        client_id: process.env.BLAZENEURO_CLIENT_ID,
        client_secret: process.env.BLAZENEURO_CLIENT_SECRET,
      }),
    });

    const tokens = await tokenResponse.json();
    
    // Redirect back to app with success
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.redirect(`${redirectUrl}?error=auth_failed`);
  }
}
