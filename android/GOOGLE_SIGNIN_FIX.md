# Fix Google Sign-In Error [28444]

## Error Message
```
Sign-in failed: [28444] Developer console is not set up correctly
```

## Root Cause
The OAuth consent screen in Google Cloud Console is not properly configured.

## Solution - Step by Step

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Select Your Project
Make sure you're in the correct project where your OAuth client ID was created.

### 3. Configure OAuth Consent Screen

**Navigate to:**
- APIs & Services → OAuth consent screen

**Fill in Required Fields:**

#### App Information
- **App name**: BlazeNeuro
- **User support email**: Your email address
- **App logo**: (Optional) Upload your app logo

#### App Domain (Optional but recommended)
- **Application home page**: https://auth.blazeneuro.com
- **Application privacy policy link**: https://auth.blazeneuro.com/privacy
- **Application terms of service link**: https://auth.blazeneuro.com/terms

#### Developer Contact Information
- **Email addresses**: Your email address

Click **SAVE AND CONTINUE**

### 4. Configure Scopes

Click **ADD OR REMOVE SCOPES**

Select these scopes:
- ✅ `.../auth/userinfo.email` - See your primary Google Account email address
- ✅ `.../auth/userinfo.profile` - See your personal info, including any personal info you've made publicly available
- ✅ `openid` - Associate you with your personal info on Google

Click **UPDATE** then **SAVE AND CONTINUE**

### 5. Add Test Users (For Testing Phase)

If your app is in "Testing" mode:
- Click **ADD USERS**
- Add email addresses of users who will test the app
- Click **ADD**
- Click **SAVE AND CONTINUE**

### 6. Verify OAuth Client Configuration

**Navigate to:**
- APIs & Services → Credentials

**Find your OAuth 2.0 Client ID:**
- Client ID: `841705301007-omj258p51fndh8n7e41l260c58rdmg4h.apps.googleusercontent.com`

**Click on it and verify:**
- **Application type**: Android
- **Package name**: `com.blazeneuro`
- **SHA-1 certificate fingerprint**: `CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92`

If any of these are wrong, click **EDIT** and fix them.

### 7. Publish App (Optional - For Production)

If you want to make the app available to all users:
- Go back to OAuth consent screen
- Click **PUBLISH APP**
- Submit for verification (required for production)

For testing, you can keep it in "Testing" mode and just add test users.

## Alternative: Create New OAuth Client

If the above doesn't work, create a new Android OAuth client:

1. Go to **APIs & Services → Credentials**
2. Click **+ CREATE CREDENTIALS → OAuth client ID**
3. Select **Android**
4. Fill in:
   - **Name**: BlazeNeuro Android
   - **Package name**: `com.blazeneuro`
   - **SHA-1 certificate fingerprint**: `CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92`
5. Click **CREATE**
6. Copy the new Client ID
7. Update `GoogleAuthManager.kt` line 12 with the new Client ID

## Verify Setup

After configuration, test the flow:
1. Uninstall the app from your device
2. Reinstall: `adb install -r app/build/outputs/apk/debug/app-debug.apk`
3. Open app and tap "Continue with Google"
4. Should show Google account picker
5. Select account
6. Should successfully sign in

## Common Issues

### Issue: "This app is blocked"
**Solution**: Add your Google account as a test user in OAuth consent screen

### Issue: "Invalid client"
**Solution**: Verify package name and SHA-1 fingerprint match exactly

### Issue: Still getting [28444]
**Solution**: 
1. Clear app data: Settings → Apps → BlazeNeuro → Clear Data
2. Wait 5-10 minutes for Google's cache to update
3. Try again

## Current Configuration

**Package Name**: `com.blazeneuro`
**SHA-1 (Debug)**: `CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92`
**Client ID**: `841705301007-omj258p51fndh8n7e41l260c58rdmg4h.apps.googleusercontent.com`
**Backend**: `https://auth.blazeneuro.com/oauth/api/auth/google/android`

## Need Help?

If you're still having issues:
1. Check Google Cloud Console → APIs & Services → Dashboard for any errors
2. Verify the OAuth consent screen status (Testing/In Production)
3. Make sure your Google account is added as a test user
4. Try with a different Google account
