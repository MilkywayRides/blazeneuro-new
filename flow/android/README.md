# SB Style Hub - Android App

## Setup

1. Open `/android` in Android Studio
2. Update API base URL in `MainActivity.kt`:
   ```kotlin
   .baseUrl("http://YOUR_IP:3000/")
   ```
3. Build and run

## Features

- OAuth authentication via Chrome Custom Tabs
- Design prompt input
- 4-angle image generation
- 3D model conversion
- Image grid display

## Deep Link

The app handles `sbstylehub://callback` for OAuth redirect.

## Dependencies

- Jetpack Compose
- Retrofit
- Coil (image loading)
- Chrome Custom Tabs
