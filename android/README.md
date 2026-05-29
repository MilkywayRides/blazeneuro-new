# BlazeNeuro Android App

Minimal Kotlin Android app with custom lightweight UI matching shadcn design.

## Setup Instructions

### 1. Authorize USB Debugging
- On your Samsung A35, you should see a popup "Allow USB debugging?"
- Check "Always allow from this computer"
- Tap "Allow"

### 2. Build and Install

```bash
cd /home/ankit/Documents/Code/blazeneuro/android

# Build the app
./gradlew assembleDebug

# Install on device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 3. Or Build and Run Directly

```bash
./gradlew installDebug
```

## Features

- ✅ Custom lightweight UI (no Material Design)
- ✅ Shadcn-inspired design system
- ✅ Email/Password login
- ✅ Session management
- ✅ Home screen with user name
- ✅ API integration with auth.blazeneuro.com

## API Endpoints Used

- `POST /api/auth/sign-in/email` - Login with email/password

## Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/blazeneuro/
│   │   │   ├── MainActivity.kt
│   │   │   ├── LoginActivity.kt
│   │   │   └── HomeActivity.kt
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   ├── values/
│   │   │   └── drawable/
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
└── build.gradle.kts
```

## Requirements

- Android SDK 24+
- Kotlin 1.9.20
- Gradle 8.2

## GitHub Actions Android auto-update flow

The app now checks the latest GitHub Release for this repository when it starts. If the release contains an APK and the release body includes a larger `Android versionCode`, the app shows a **New update available** popup, downloads the APK, and opens the Android installer.

To publish an update:

1. Push your code to GitHub.
2. Create and push a version tag, for example:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. GitHub Actions builds the Android APK and publishes it to a GitHub Release.
4. Installed apps built by the pipeline detect the new release automatically.

For production updates, configure these GitHub repository secrets so every update uses the same signing certificate:

- `ANDROID_SIGNING_KEY_BASE64` — base64-encoded `.jks` keystore file.
- `ANDROID_KEYSTORE_PASSWORD` — keystore password.
- `ANDROID_KEY_ALIAS` — signing key alias.
- `ANDROID_KEY_PASSWORD` — signing key password.

Without signing secrets, the workflow still uploads a debug APK artifact/release for testing, but Android will only install updates over an existing app when the signatures match.
