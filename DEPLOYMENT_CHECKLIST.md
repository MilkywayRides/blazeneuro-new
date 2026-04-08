# Deployment Checklist

## Pre-Deployment

- [ ] Node.js >= 20.9.0 installed
- [ ] PostgreSQL database provisioned
- [ ] Domain DNS configured (auth.blazeneuro.com)
- [ ] SSL/TLS certificates configured
- [ ] Environment variables prepared

## Environment Setup

### Required Variables
```bash
NEXT_PUBLIC_AUTH_URL=https://auth.blazeneuro.com
DATABASE_URL=postgresql://user:password@host:5432/database
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BLAZENEURO_API_KEY=<generate-with-openssl-rand-base64-32>
```

### Optional OAuth Variables
```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
RESEND_API_KEY=
DOMAIN=blazeneuro.com
```

## OAuth Provider Configuration

### Google OAuth
1. Go to Google Cloud Console
2. Update authorized redirect URIs:
   - `https://auth.blazeneuro.com/api/auth/callback/google`
3. Update authorized JavaScript origins:
   - `https://auth.blazeneuro.com`

### GitHub OAuth
1. Go to GitHub Developer Settings
2. Update callback URL:
   - `https://auth.blazeneuro.com/api/auth/callback/github`
3. Update homepage URL:
   - `https://auth.blazeneuro.com`

## Database Migration

```bash
npm run db:push
```

## Build & Test

```bash
npm install
npm run build
npm start
```

## Deployment Steps

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure custom domain: auth.blazeneuro.com
4. Deploy

### Manual Deployment
1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Configure reverse proxy (nginx/caddy)
4. Set up SSL certificates
5. Configure process manager (PM2)

## Post-Deployment

- [ ] Verify auth.blazeneuro.com is accessible
- [ ] Test user registration
- [ ] Test user login
- [ ] Test OAuth providers (Google, GitHub)
- [ ] Verify cross-subdomain cookies work
- [ ] Test admin panel access
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerting

## Security Checklist

- [ ] HTTPS enabled
- [ ] Secure cookies configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Database credentials secured
- [ ] API keys rotated from defaults
- [ ] Security headers configured

## Rollback Plan

If issues occur:
1. Revert to previous deployment
2. Check logs: `npm run logs`
3. Verify environment variables
4. Test database connectivity
