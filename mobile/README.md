# BlazeNeuro Mobile

React Native mobile app for BlazeNeuro built with Expo.

## Features

- Email/Password authentication
- OTP verification via email
- Social auth (GitHub, Google) - UI ready
- Dark theme matching web app
- Same authentication flow as web

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the app:
```bash
npm start
```

3. Run on device:
- Scan QR code with Expo Go app (iOS/Android)
- Or press `a` for Android emulator
- Or press `i` for iOS simulator (macOS only)

## API Configuration

Update the API_URL in `services/auth.ts` to point to your backend:
```typescript
const API_URL = 'http://YOUR_IP:3000/api/auth';
```

Note: Use your computer's IP address, not localhost, when testing on physical devices.

## Screens

- **Login**: Email/password login with social auth options
- **Signup**: Create account with email verification
- **Verify**: OTP verification screen
- **Home**: Main app screen after authentication
