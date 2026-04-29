# 📊 Data Collection Phase

## Current Mode: Collecting User Interactions

The system is now in **data collection mode** - it will record 10 user search queries and their clicked results before enabling AI training.

## 🎯 What's Happening

### Phase 1: Data Collection (Current)
- ✅ Shows normal blog search results
- ✅ Records every click in `search_interactions` table
- ✅ Displays progress: "X/10 interactions recorded"
- ❌ NO AI ranking yet (comes after 10 interactions)

### Phase 2: AI Training (After 10 clicks)
- Will use collected data to train the PyTorch model
- Model learns which results users prefer
- Future searches will show AI-ranked results with percentages

## 📝 Database Schema

```sql
search_interactions table:
- query (what user searched)
- result_id (which blog they clicked)
- result_title (blog title)
- result_description (blog excerpt)
- clicked (always true for now)
- position (where in results list)
- created_at (timestamp)
```

## 🚀 How to Use

1. **Visit**: http://localhost:3000/ai-search

2. **Search** for blogs (e.g., "javascript", "python", "react")

3. **Click** on results you find relevant

4. **Watch progress**: Top banner shows "X/10 interactions recorded"

5. **After 10 clicks**: System will be ready for AI training

## 📊 Check Database

```bash
export DATABASE_URL="your_database_url"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM search_interactions;"
psql "$DATABASE_URL" -c "SELECT query, result_title, created_at FROM search_interactions ORDER BY created_at DESC LIMIT 10;"
```

## 🔄 Next Steps (After 10 Interactions)

Once you have 10 interactions:
1. Data will be sent to Modal for training
2. PyTorch model learns patterns
3. Future searches show AI-ranked results
4. Percentages appear on the right

## 💡 Why This Approach?

- **Cold start problem**: AI needs data to learn
- **Quality data**: Real user behavior is better than synthetic
- **Incremental**: Start simple, add AI after collecting patterns

---

**Current Status**: 🟡 Collecting data (0/10)
