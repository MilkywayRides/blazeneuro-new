# BlazeNeuro Security Architecture

## Authentication System

### OAuth 2.0 Implementation
- **Provider**: Better Auth with Drizzle ORM
- **Subdomain**: auth.blazeneuro.com
- **Session Management**: Secure HTTP-only cookies with 7-day expiration
- **CSRF Protection**: Token-based validation for state-changing operations

### Security Features

#### 1. Rate Limiting
- 100 requests per minute per IP
- Prevents brute force attacks
- In-memory store (upgrade to Redis for production)

#### 2. Session Security
- HTTP-only cookies (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)
- 7-day expiration with 1-day update age
- Cookie cache with 5-minute TTL

#### 3. Password Security
- Minimum 8 characters
- Hashed with bcrypt (via Better Auth)
- No password stored in plain text

#### 4. API Security
- Bearer token authentication
- Role-based access control (RBAC)
- Admin-only endpoints protected
- Input sanitization (XSS prevention)
- SQL injection prevention (Drizzle ORM parameterized queries)

#### 5. Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'
```

#### 6. CORS Configuration
- Whitelist-based origin validation
- Credentials allowed only for trusted origins
- Preflight request handling

#### 7. Cross-Subdomain Authentication
- Shared cookies across *.blazeneuro.com
- Secure token passing
- Origin validation

## API Endpoints

### Public Endpoints
- `POST /api/auth/sign-in/email` - Email/password login
- `POST /api/auth/sign-up/email` - User registration
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/callback/github` - GitHub OAuth callback

### Protected Endpoints (Requires Authentication)
- `GET /api/user/me` - Get current user
- `PATCH /api/user/me` - Update current user

### Admin Endpoints (Requires Admin Role)
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/blogs` - List all blogs
- `GET /api/admin/oauth/apps` - List OAuth applications

## Role-Based Access Control

### Roles
1. **user** (default) - Standard user access
2. **admin** - Administrative access
3. **superAdmin** - Full system access

### Admin Emails (Hardcoded)
- admin@blazeneuro.com
- ankityadav7420@gmail.com

## Environment Variables

### Required
```env
BETTER_AUTH_SECRET=<random-64-char-string>
NEXT_PUBLIC_AUTH_URL=https://auth.blazeneuro.com
DATABASE_URL=<postgres-connection-string>
```

### OAuth Providers
```env
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-secret>
GITHUB_CLIENT_ID=<github-oauth-client-id>
GITHUB_CLIENT_SECRET=<github-oauth-secret>
```

## Security Best Practices

### For Production
1. ✅ Use HTTPS everywhere
2. ✅ Enable secure cookies
3. ✅ Set strong BETTER_AUTH_SECRET (64+ characters)
4. ✅ Use Redis for rate limiting
5. ✅ Enable email verification
6. ✅ Implement 2FA (future enhancement)
7. ✅ Regular security audits
8. ✅ Monitor failed login attempts
9. ✅ Implement IP blocking for suspicious activity
10. ✅ Use WAF (Web Application Firewall)

### Database Security
- Parameterized queries (Drizzle ORM)
- No raw SQL execution
- Connection pooling
- Encrypted connections (SSL/TLS)

### API Key Management (Future)
- SHA-256 hashed keys
- Scoped permissions
- Expiration dates
- Revocation support

## Threat Mitigation

### Protected Against
- ✅ SQL Injection (ORM parameterization)
- ✅ XSS (Input sanitization, CSP headers)
- ✅ CSRF (Token validation, SameSite cookies)
- ✅ Clickjacking (X-Frame-Options)
- ✅ MIME sniffing (X-Content-Type-Options)
- ✅ Brute force (Rate limiting)
- ✅ Session hijacking (Secure cookies, HTTPS)
- ✅ Man-in-the-middle (HSTS, secure cookies)

### Monitoring Required
- Failed login attempts
- Unusual API usage patterns
- Rate limit violations
- Admin action logs

## Compliance
- GDPR ready (user data deletion)
- Password security standards
- Session management best practices
- Audit logging capability
