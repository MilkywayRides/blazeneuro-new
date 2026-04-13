# Live Audience Location Tracking

## Setup Instructions

### 1. Database Migration
Run this SQL to create the table:
```sql
CREATE TABLE "deviceLocation" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "user"("id"),
  "deviceId" TEXT NOT NULL,
  "latitude" TEXT NOT NULL,
  "longitude" TEXT NOT NULL,
  "lastSeen" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Or use Drizzle:
```bash
npm run db:push
```

### 2. Environment Variables
Add to `.env`:
```
LOCATION_SECRET=your-super-secret-key-here
```

### 3. Android Setup

#### Add dependencies to `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-location:21.0.1'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
}
```

#### Add permissions to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

#### Update LocationService.kt:
Replace `YOUR_SECRET_HERE` with your actual `LOCATION_SECRET`

### 4. Access Admin Globe
Navigate to: `https://blazeneuro.com/admin/globe`

## Security Features
- Bearer token authentication for location submission
- Admin-only access to view locations
- Session-based authentication for admin panel
- Only shows devices active in last 5 minutes

## API Endpoints

### POST /api/mobile/location
Submit device location (requires Bearer token)
```json
{
  "deviceId": "uuid",
  "latitude": "28.6139",
  "longitude": "77.2090",
  "userId": "optional-user-id"
}
```

### GET /api/admin/locations
Fetch active locations (admin only)
Returns devices active in last 5 minutes
