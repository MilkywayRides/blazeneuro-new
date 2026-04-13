# Quick Checklist: Fix Google Sign-In [28444]

## ⚠️ MAIN ISSUE: You Need a WEB Client ID

Your current client ID `841705301007-omj258p51fndh8n7e41l260c58rdmg4h` is an **Android** client.

The Credential Manager API needs a **WEB** client ID.

## Steps to Fix (5 minutes)

### ✅ Step 1: Create Web OAuth Client
1. Google Cloud Console → Credentials
2. CREATE CREDENTIALS → OAuth client ID
3. Application type: **Web application**
4. Name: `BlazeNeuro Web`
5. CREATE
6. **Copy the Client ID**

### ✅ Step 2: Update App Code
Edit: `app/src/main/java/com/blazeneuro/GoogleAuthManager.kt`

Line 12, replace:
```kotlin
private val WEB_CLIENT_ID = "841705301007-omj258p51fndh8n7e41l260c58rdmg4h.apps.googleusercontent.com"
```

With your new Web client ID:
```kotlin
private val WEB_CLIENT_ID = "YOUR_NEW_WEB_CLIENT_ID.apps.googleusercontent.com"
```

### ✅ Step 3: Verify OAuth Consent Screen

Go to: OAuth consent screen

**Must have:**
- ✅ App name: BlazeNeuro
- ✅ User support email: (your email)
- ✅ Scopes: email, profile, openid
- ✅ Test users: (add your Google account if status is "Testing")

**Publishing Status:**
- If "Testing" → Add your email as test user
- If "In production" → Should work for all users

### ✅ Step 4: Keep Both Clients

You need BOTH OAuth clients:

**Web Client** (NEW - for code):
- Type: Web application
- Used in: GoogleAuthManager.kt
- Purpose: Credential Manager API

**Android Client** (EXISTING - keep it):
- Type: Android
- Package: com.blazeneuro
- SHA-1: CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92
- Purpose: App verification by Google Play Services

### ✅ Step 5: Rebuild
```bash
cd /home/ankit/Documents/Code/blazeneuro/android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### ✅ Step 6: Test
1. Open app
2. Tap "Continue with Google"
3. Should show account picker
4. Select account
5. Should sign in successfully

## Why This Error Happens

Error `[28444]` means:
- ❌ Wrong client ID type (Android instead of Web)
- ❌ OAuth consent screen not configured
- ❌ Test user not added (if in Testing mode)

## After Fix

Your setup will have:
1. ✅ Web OAuth client ID (in code)
2. ✅ Android OAuth client (in Google Cloud)
3. ✅ OAuth consent screen configured
4. ✅ Test users added

Then Google Sign-In will work! 🎉
