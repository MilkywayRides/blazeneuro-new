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
