# BlazeNeuro React Native Expo App

This is a React Native Expo version of the BlazeNeuro Android app with the same UI and functionality.

## Setup Instructions

### 1. Install Dependencies
cd /home/ankit/Documents/Code/blazeneuro/native
npm install

### 2. Run the App
# For Android
npm run android

# For iOS (requires Mac)
npm run ios

# For web
npm run web

## Features

- Custom lightweight UI matching shadcn design (same as Android app)
- Animated background circles
- Email/Password login and signup
- Session management simulation
- Home screen with user greeting
- Clean, modern interface

## Project Structure

native/
├── App.tsx
├── app.json
├── package.json
├── src/
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── theme/
│   │   └── colors.ts
│   ├── components/
│   ├── navigation/
│   └── utils/
└── assets/

## Design System

The app uses the same shadcn-inspired design system as the Android app:
- Zinc-based color palette
- Glassmorphism effects
- Clean typography
- Consistent spacing and layout

## API Integration

The app is set up to integrate with the same BlazeNeuro API endpoints as the Android app:
- POST /api/auth/sign-in/email
- POST /api/auth/sign-up/email

Currently, API calls are simulated for demonstration purposes.
