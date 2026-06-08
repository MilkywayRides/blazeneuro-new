# FastAPI & Modal Backends

This directory contains the FastAPI and Modal backends for BlazeNeuro.

## Auto Videos (AI Podcast Clipper)
The AI Podcast Clipper is a Modal app that generates short vertical clips from podcasts.

### Deployment
1. Install Modal: `pip install modal`
2. Authenticate: `modal setup`
3. Deploy the clipper:
   ```bash
   modal deploy modal_auto_video.py
   ```
4. Configure Secrets in Modal:
   Create a secret named `ai-podcast-clipper-secret` with:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `AUTH_TOKEN`: A secret token for the web endpoint
   - `AWS_ACCESS_KEY_ID`: AWS credentials for S3
   - `AWS_SECRET_ACCESS_KEY`: AWS credentials for S3
   - `AWS_REGION`: AWS region
   - `S3_BUCKET_NAME`: S3 bucket for uploads and clips

### Integration
Once deployed, set the following environment variables in your Next.js `.env.local`:
- `AUTO_VIDEO_MODAL_URL`: The web endpoint URL from the Modal deployment
- `AUTO_VIDEO_MODAL_AUTH`: The `AUTH_TOKEN` you set in Modal secrets

## Minimal FastAPI Setup

Minimal FastAPI setup using the same PostgreSQL database as the Next.js app.

### Setup

1. Install dependencies:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

2. Copy DATABASE_URL from `../.env.local` to `.env`

3. Run the server:
```bash
./run.sh
# or
uvicorn main:app --reload --port 8000
```

### Test

In another terminal:
```bash
source venv/bin/activate
python test_api.py
```

Or use curl:
```bash
curl http://localhost:8000/
curl http://localhost:8000/test-db
```

### Endpoints

- `GET /` - Health check
- `GET /test-db` - Test database connection (counts users)
