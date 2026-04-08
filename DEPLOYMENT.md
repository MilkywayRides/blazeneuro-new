# Deployment Guide

## Prerequisites

- Node.js >= 20.9.0
- PostgreSQL database
- Domain configured: auth.blazeneuro.com

## Environment Variables

Set these in your deployment platform:

```bash
NEXT_PUBLIC_AUTH_URL=https://auth.blazeneuro.com
DATABASE_URL=postgresql://user:password@host:5432/database
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BLAZENEURO_API_KEY=<generate-with-openssl-rand-base64-32>

# Optional OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## Database Setup

1. Run migrations:
```bash
npm run db:push
```

## Build & Deploy

```bash
npm install
npm run build
npm start
```

## Vercel Deployment

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

## Domain Configuration

- Point auth.blazeneuro.com to your deployment
- Ensure SSL/TLS is enabled
- Configure CORS for cross-subdomain cookies
