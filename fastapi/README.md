# FastAPI Backend

Minimal FastAPI setup using the same PostgreSQL database as the Next.js app.

## Setup

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

## Test

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

## Endpoints

- `GET /` - Health check
- `GET /test-db` - Test database connection (counts users)
