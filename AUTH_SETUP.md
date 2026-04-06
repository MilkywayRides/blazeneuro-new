# BlazeNeuro - Project Structure

## Authentication Setup

### Overview
This project uses **better-auth** for authentication with a separate auth subdomain deployment strategy.

### Architecture

```
Main App: blazeneuro.com
Auth Pages: auth.blazeneuro.com (serves /oauth routes)
API Backend: blazeneuro.com/api/auth (handles all auth logic)
```

### Folder Structure

```
src/
├── app/
│   ├── oauth/              # Auth pages (deployed to auth.blazeneuro.com)
│   │   └── login/          # Login page
│   ├── api/
│   │   └── auth/           # Auth API routes (deployed with main app)
│   └── page.tsx            # Main landing page
├── lib/
│   ├── auth.ts             # Better-auth server config
│   └── auth-client.ts      # Better-auth client config
└── components/
    └── login-form.tsx      # Login form component
```

### Deployment Strategy

#### Main App (blazeneuro.com)
- Deploy entire Next.js app
- Includes API routes at `/api/auth/*`
- Handles all backend authentication logic

#### Auth Subdomain (auth.blazeneuro.com)
- Deploy only `/oauth` routes
- Configure Next.js rewrites to point to main API
- Set `NEXT_PUBLIC_AUTH_URL=https://blazeneuro.com`

### Configuration

1. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Update `NEXT_PUBLIC_AUTH_URL` based on environment
   - Add OAuth provider credentials if needed

2. **For Separate Auth Domain Deployment**
   Create `next.config.ts` with rewrites:
   ```typescript
   rewrites: async () => [
     {
       source: '/api/auth/:path*',
       destination: 'https://blazeneuro.com/api/auth/:path*'
     }
   ]
   ```

3. **Database**
   - Currently configured for SQLite (development)
   - For production, update `src/lib/auth.ts` with your database provider

### Usage

**Login Page**: `/oauth/login`
**API Endpoints**: `/api/auth/*`

### Next Steps

1. Set up your database
2. Configure OAuth providers (optional)
3. Customize login form in `src/components/login-form.tsx`
4. Add signup, forgot password pages in `/oauth` folder
5. Configure CORS for cross-domain auth
