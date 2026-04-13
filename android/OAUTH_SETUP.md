# OAuth Configuration for BlazeNeuro Android App

## Package Information
- **Package Name**: `com.blazeneuro`
- **SHA-1 (Debug)**: `CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92`

## Google OAuth Setup

### Google Cloud Console Configuration
1. **Client ID**: `841705301007-omj258p51fndh8n7e41l260c58rdmg4h.apps.googleusercontent.com`
2. **Package Name**: `com.blazeneuro`
3. **SHA-1**: `CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92`

### Backend Endpoint
- **URL**: `https://auth.blazeneuro.com/oauth/api/auth/google/android`
- **Method**: POST
- **Body**: `{ "idToken": "..." }`
- **Response**: `{ "token": "...", "user": { "id": "...", "email": "...", "name": "...", "role": "..." } }`

### Fix for "Developer console not set up correctly" Error
You need to configure the OAuth consent screen in Google Cloud Console:
1. Go to Google Cloud Console → APIs & Services → OAuth consent screen
2. Fill in required fields:
   - App name: BlazeNeuro
   - User support email: your email
   - Developer contact: your email
3. Add scopes: email, profile, openid
4. Add test users (for testing phase)
5. Save and continue

## GitHub OAuth Setup

### GitHub OAuth App Configuration
1. **Homepage URL**: `https://auth.blazeneuro.com`
2. **Authorization callback URL**: `https://auth.blazeneuro.com/oauth/api/auth/github/android/callback`
3. **Client ID**: (Replace in GitHubAuthManager.kt line 8)
4. **Client Secret**: (Add to your backend .env.local - NEVER in Android app)

### Android Deep Link
- **Scheme**: `blazeneuro`
- **Host**: `github-callback`
- **Full URI**: `blazeneuro://github-callback`

### Backend Endpoints

#### 1. GitHub Authorization (handled by GitHub)
- User clicks "Continue with GitHub"
- App opens: `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=user:email read:user&state=...`
- GitHub redirects to: `https://auth.blazeneuro.com/oauth/api/auth/github/android/callback?code=...&state=...`

#### 2. Backend Callback Handler
Your backend at `https://auth.blazeneuro.com/oauth/api/auth/github/android/callback` should:
- Receive the `code` and `state` from GitHub
- Redirect to: `blazeneuro://github-callback?code=...&state=...`
- This opens the Android app via deep link

#### 3. Token Exchange
- **URL**: `https://auth.blazeneuro.com/oauth/api/auth/github/android/token`
- **Method**: POST
- **Body**: `{ "code": "...", "state": "..." }`
- **Response**: `{ "token": "...", "user": { "id": "...", "email": "...", "name": "...", "role": "..." } }`

## Flow Diagrams

### Google Sign-In Flow
```
User taps "Continue with Google"
    ↓
Google Sign-In sheet appears (native)
    ↓
User selects account
    ↓
App receives ID token
    ↓
POST to auth.blazeneuro.com/oauth/api/auth/google/android
    ↓
Backend verifies token with Google
    ↓
Backend returns session token
    ↓
App saves token and navigates to home
```

### GitHub Sign-In Flow
```
User taps "Continue with GitHub"
    ↓
Custom Tab opens: github.com/login/oauth/authorize
    ↓
User authorizes app
    ↓
GitHub redirects to: auth.blazeneuro.com/oauth/api/auth/github/android/callback?code=xxx
    ↓
Backend redirects to: blazeneuro://github-callback?code=xxx&state=xxx
    ↓
Android app receives deep link
    ↓
POST to auth.blazeneuro.com/oauth/api/auth/github/android/token
    ↓
Backend exchanges code for GitHub token
    ↓
Backend returns session token
    ↓
App saves token and navigates to home
```

## Files Modified/Created

### New Files
- `GoogleAuthManager.kt` - Handles Google Sign-In using Credential Manager
- `GitHubAuthManager.kt` - Handles GitHub OAuth flow
- `RetrofitClient.kt` - API service for backend communication
- `SessionManager.kt` - Secure token storage with encryption

### Modified Files
- `build.gradle.kts` - Added OAuth dependencies
- `AndroidManifest.xml` - Added deep link for GitHub callback
- `LoginActivity.kt` - Integrated Google and GitHub sign-in
- `SignupActivity.kt` - Integrated Google and GitHub sign-in
- `AuthApi.kt` - Added public method for OAuth session saving

## Testing

### Test Google Sign-In
1. Make sure OAuth consent screen is configured
2. Add your Google account as a test user
3. Tap "Continue with Google"
4. Select account
5. Should navigate to home screen

### Test GitHub Sign-In
1. Make sure GitHub OAuth app is created
2. Update `GITHUB_CLIENT_ID` in `GitHubAuthManager.kt`
3. Tap "Continue with GitHub"
4. Authorize app
5. Should redirect back to app and navigate to home screen

## Security Notes

- ✅ Google ID token is verified by backend
- ✅ GitHub client secret is NEVER in Android app
- ✅ Session tokens stored with AES256_GCM encryption
- ✅ CSRF protection with state parameter for GitHub
- ✅ Deep links use custom scheme (not https)
- ✅ All OAuth flows go through your backend
