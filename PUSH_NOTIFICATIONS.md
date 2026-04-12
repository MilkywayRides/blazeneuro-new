# Push Notification System

## Overview
Complete push notification system from admin panel to Android mobile app with deep linking support.

## Features
- ✅ Admin panel at `http://localhost:3000/admin/notifications` (deployed: `https://blazeneuro.com/admin/notifications`)
- ✅ Send notifications with title, message, type, and optional link
- ✅ Android app receives notifications via polling (every 30 seconds)
- ✅ System notifications with deep linking
- ✅ In-app notification badge and bottom sheet
- ✅ PostgreSQL storage using Drizzle ORM
- ✅ Type-safe implementation

## Architecture

### Backend (Next.js)
- **Admin API**: `/app/api/admin/push-notification/route.ts`
  - POST endpoint to create notifications
  - Stores in PostgreSQL `notification` table
  
- **Mobile API**: `/app/api/mobile/notifications/route.ts`
  - GET endpoint to fetch notifications
  - POST endpoint to mark as read

### Frontend (Admin Panel)
- **Location**: `/app/admin/notifications/page.tsx`
- **Fields**:
  - Title (required)
  - Message (required)
  - Link (optional) - for deep linking
  - Type (info, mention, reply, like)

### Android App
- **NotificationManager**: `/android/app/src/main/java/com/blazeneuro/NotificationManager.kt`
  - Polls server every 30 seconds
  - Shows system notifications
  - Handles deep linking
  - Manages notification badge

## Usage

### Send Notification from Admin
1. Navigate to `http://localhost:3000/admin/notifications`
2. Fill in:
   - **Title**: "New Blog Post"
   - **Message**: "Check out our latest article on AI"
   - **Link**: "https://blazeneuro.com/blogs/ai-article" (optional)
   - **Type**: "info"
3. Click "Send Notification"

### Android App Behavior
- Notification appears in system tray
- Badge shows on notification icon in app
- Tapping notification opens the link (if provided) or app home
- In-app bottom sheet shows all notifications

## Database Schema

```sql
CREATE TABLE notification (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user(id),  -- NULL for broadcast
  title TEXT NOT NULL,
  description TEXT,  -- Format: "message|link" (link optional)
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### POST /api/admin/push-notification
Send a notification to all users.

**Request:**
```json
{
  "title": "New Feature",
  "message": "We've added dark mode!",
  "link": "https://blazeneuro.com/features",
  "type": "info"
}
```

**Response:**
```json
{
  "success": true,
  "notification": { ... },
  "message": "Notification pushed successfully"
}
```

### GET /api/mobile/notifications
Fetch notifications for mobile app.

**Response:**
```json
[
  {
    "id": "notif_123",
    "title": "New Feature",
    "description": "We've added dark mode!|https://blazeneuro.com/features",
    "type": "info",
    "read": false,
    "createdAt": "2026-04-12T20:00:00Z"
  }
]
```

### POST /api/mobile/notifications
Mark notification as read.

**Request:**
```json
{
  "notificationId": "notif_123"
}
```

## Deep Linking

Notifications support deep linking to any URL:
- Blog posts: `https://blazeneuro.com/blogs/slug`
- External links: Any valid URL
- If no link provided, opens app home

## Android Permissions

Required in `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## Testing

1. **Start dev server**: `npm run dev`
2. **Open admin panel**: http://localhost:3000/admin/notifications
3. **Send test notification**
4. **Check Android app** (within 30 seconds)
5. **Verify system notification appears**
6. **Tap notification to test deep linking**

## Production Deployment

The system is deployed at:
- **Admin Panel**: https://blazeneuro.com/admin/notifications
- **API**: https://blazeneuro.com/api/admin/push-notification

Android app polls: https://blazeneuro.com/api/mobile/notifications

## Future Enhancements

- [ ] Real-time notifications using WebSockets/FCM
- [ ] User-specific notifications
- [ ] Notification scheduling
- [ ] Rich media support (images, actions)
- [ ] Notification analytics
- [ ] Push notification preferences per user
