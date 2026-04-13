# URGENT: Fix Google Sign-In Error [28444]

## The Problem

You're using an **Android OAuth client ID**, but Google's Credential Manager API requires a **WEB OAuth client ID**.

The client ID `841705301007-omj258p51fndh8n7e41l260c58rdmg4h.apps.googleusercontent.com` is an Android client, but `GoogleAuthManager.kt` needs a Web client ID in the `setServerClientId()` parameter.

## Solution: Create a Web OAuth Client

### Step 1: Create Web OAuth Client

1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application**
4. Fill in:
   - **Name**: BlazeNeuro Web (for Android)
   - **Authorized JavaScript origins**: (leave empty)
   - **Authorized redirect URIs**: (leave empty)
5. Click **CREATE**
6. **Copy the Client ID** (it will look like: `XXXXXX.apps.googleusercontent.com`)

### Step 2: Update Your Android App

Replace the Client ID in `GoogleAuthManager.kt`:

```kotlin
private val WEB_CLIENT_ID = "YOUR_NEW_WEB_CLIENT_ID.apps.googleusercontent.com"
```

### Step 3: Keep Your Android OAuth Client

**DO NOT DELETE** your Android OAuth client (`com.blazeneuro` with SHA-1).

You need **BOTH**:
- ✅ **Web OAuth client** - Used in the app code for Credential Manager API
- ✅ **Android OAuth client** - Used by Google Play Services to verify your app

### Step 4: Configure OAuth Consent Screen

Make sure OAuth consent screen is configured:

1. Go to **OAuth consent screen**
2. **User Type**: External (or Internal if G Workspace)
3. Click **EDIT APP**

**App information:**
- App name: `BlazeNeuro`
- User support email: `your-email@example.com`
- Developer contact: `your-email@example.com`

**Scopes:**
- Click **ADD OR REMOVE SCOPES**
- Select:
  - `userinfo.email`
  - `userinfo.profile`
  - `openid`
- Click **UPDATE** → **SAVE AND CONTINUE**

**Test users** (if in Testing mode):
- Click **ADD USERS**
- Add your Google account email
- Click **ADD** → **SAVE AND CONTINUE**

Click **BACK TO DASHBOARD**

### Step 5: Rebuild and Test

```bash
cd /home/ankit/Documents/Code/blazeneuro/android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Wait 5-10 minutes for Google's servers to sync, then test.

## Why This Happens

The new **Credential Manager API** (used in your app) requires:
- A **Web client ID** in the code
- An **Android client ID** registered in Google Cloud (for app verification)

The old **GoogleSignInClient** API only needed the Android client ID.

## Summary

**Current Setup (Wrong):**
- ❌ Using Android client ID in code
- ✅ Android OAuth client exists

**Correct Setup:**
- ✅ Use Web client ID in code (`GoogleAuthManager.kt`)
- ✅ Keep Android OAuth client (for verification)
- ✅ OAuth consent screen configured
- ✅ Test users added (if in Testing mode)

## After Creating Web Client

1. Copy the Web client ID
2. Update line 12 in `GoogleAuthManager.kt`:
   ```kotlin
   private val WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
   ```
3. Rebuild and install the app
4. Test Google Sign-In

The error should be resolved!
