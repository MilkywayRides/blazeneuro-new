# 🔧 Data Collection - Troubleshooting Guide

## ✅ Database Status: WORKING

The `search_interactions` table exists and is ready to collect data.

## 🚀 How to Test

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Visit Search Page
```
http://localhost:3000/ai-search
```

### 3. Search & Click
- Type a search query (e.g., "javascript")
- Click on any result
- You should see an alert: "✅ Recorded! 1/10 interactions collected"

### 4. Check Browser Console
Open DevTools (F12) and look for:
```
Tracking click: { query: "javascript", resultId: "...", title: "..." }
Tracking response: { success: true, collected: 1, remaining: 9 }
```

### 5. Verify Database
```bash
./test-db-connection.sh
```

Or manually:
```bash
export DATABASE_URL="your_database_url"
psql "$DATABASE_URL" -c "SELECT * FROM search_interactions ORDER BY created_at DESC LIMIT 5;"
```

## 🐛 If Data Not Saving

### Check 1: API Route Working?
```bash
curl -X PUT http://localhost:3000/api/ai-search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","resultId":"123","title":"Test","description":"Test","clicked":true,"position":0}'
```

Should return:
```json
{"success":true,"collected":1,"remaining":9}
```

### Check 2: Database Connection?
Run: `./test-db-connection.sh`

Should show: "✅ Database test complete!"

### Check 3: Browser Errors?
- Open DevTools (F12)
- Go to Console tab
- Look for red errors
- Check Network tab for failed requests

## 📊 Expected Flow

```
User clicks result
    ↓
Frontend sends PUT to /api/ai-search
    ↓
API inserts into database
    ↓
Returns { success: true, collected: X }
    ↓
Alert shows "✅ Recorded! X/10"
    ↓
Navigate to blog
```

## 🎯 What You Should See

1. **Alert popup**: "✅ Recorded! 1/10 interactions collected"
2. **Blue banner updates**: "📊 Data Collection: 1/10 interactions recorded"
3. **Console logs**: Success messages
4. **Database**: New row in search_interactions table

## 📝 Manual Database Insert (for testing)

```sql
INSERT INTO search_interactions 
(query, result_id, result_title, result_description, clicked, position, ai_score) 
VALUES 
('javascript', 'blog-123', 'JavaScript Tutorial', 'Learn JS basics', true, 0, 0);
```

---

**Status**: 🟢 Database ready, API ready, waiting for user interactions!
