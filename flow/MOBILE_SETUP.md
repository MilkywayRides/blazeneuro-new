# Boutique Mobile App - Setup Guide

## Architecture

- **Auth**: OAuth via browser (same as web)
- **Image Generation**: Stable Diffusion XL via Modal (4 angles)
- **3D Conversion**: TRELLIS via Modal
- **API**: Next.js API routes

## Setup

### 1. Install Modal
```bash
pip install modal
modal token new
```

### 2. Deploy Modal App
```bash
modal deploy modal_app.py
```

### 3. Update Environment
Add your Modal endpoint to `.env.local`:
```
MODAL_BOUTIQUE_ENDPOINT=https://your-modal-app.modal.run
```

### 4. Update API Routes
Replace `process.env.MODAL_ENDPOINT` with `process.env.MODAL_BOUTIQUE_ENDPOINT` in:
- `/app/api/generate-images/route.ts`
- `/app/api/generate-3d/route.ts`

## API Endpoints

### Mobile Auth
```
GET /api/auth/mobile?callbackUrl=/dashboard
Returns: { authUrl: "..." }
```

### Generate Images
```
POST /api/generate-images
Body: { prompt: "red dress" }
Returns: { images: ["url1", "url2", "url3", "url4"] }
```

### Generate 3D Model
```
POST /api/generate-3d
Body: { imageUrls: ["url1", "url2", "url3", "url4"] }
Returns: { modelUrl: "..." }
```

## Mobile App Flow

1. User taps "Sign In" → Opens browser with OAuth
2. After auth, redirects back to app
3. User enters design prompt
4. App calls `/api/generate-images` → 4 angle images
5. User confirms → App calls `/api/generate-3d` → 3D model
6. User can view/download 3D model
