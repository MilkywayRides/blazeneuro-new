# OAuth Setup for Mobile App

## Register Mobile Redirect URI

You need to add the mobile app redirect URI to your BlazeNeuro OAuth application:

1. Go to BlazeNeuro OAuth settings
2. Add redirect URI: `sbstylehub://callback`
3. Also add: `http://10.55.14.40:3000/api/auth/callback/blazeneuro`

## Current Setup

- **Mobile Deep Link**: `sbstylehub://callback`
- **API Base URL**: `http://10.55.14.40:3000`
- **Auth Flow**: 
  1. App calls `/api/auth/mobile` → gets auth URL
  2. Opens Chrome Custom Tab with BlazeNeuro OAuth
  3. User signs in
  4. Redirects to `sbstylehub://callback`
  5. App detects callback and marks user as authenticated

## Testing Without OAuth

The API endpoints now return mock data so you can test the UI flow:
- `/api/generate-images` → Returns placeholder images
- `/api/generate-3d` → Returns placeholder 3D model URL

## Next Steps

1. Register `sbstylehub://callback` in BlazeNeuro OAuth
2. Deploy Modal app for real AI generation
3. Update API routes to use Modal endpoints
