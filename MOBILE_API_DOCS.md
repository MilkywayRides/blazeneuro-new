# Secure Mobile API System

## Overview
Created **secure, fast API routes** for the mobile app with rate limiting, caching, and security headers.

## API Endpoints

### 1. **GET /api/mobile/blogs**
Fetch blog list with pagination

**Query Parameters:**
- `limit` (optional, default: 20, max: 50)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "blogs": [
    {
      "id": "uuid",
      "title": "Blog Title",
      "description": "Description",
      "slug": "blog-slug",
      "createdAt": "2026-04-10T...",
      "readTime": 5
    }
  ],
  "count": 20,
  "hasMore": true
}
```

**Security:**
- Rate limit: 100 requests/minute per IP
- Edge runtime for speed
- Cache: 5 minutes
- Security headers: X-Content-Type-Options, X-Frame-Options

---

### 2. **GET /api/mobile/search**
Search blogs by title, description, or content

**Query Parameters:**
- `q` (required, min: 2 chars, max: 100 chars)

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Blog Title",
      "description": "Description",
      "slug": "blog-slug",
      "createdAt": "2026-04-10T..."
    }
  ],
  "count": 5,
  "query": "search term"
}
```

**Security:**
- Rate limit: 50 requests/minute per IP
- Edge runtime for speed
- Cache: 3 minutes
- Input validation (2-100 chars)
- SQL injection protection via Drizzle ORM

---

### 3. **GET /api/mobile/blogs/[slug]**
Get single blog by slug

**Response:**
```json
{
  "blog": {
    "id": "uuid",
    "title": "Blog Title",
    "slug": "blog-slug",
    "description": "Description",
    "content": "Full content...",
    "createdAt": "2026-04-10T...",
    "updatedAt": "2026-04-10T..."
  }
}
```

**Security:**
- Cache: 10 minutes
- Edge runtime
- Security headers

---

## Security Features

### ✅ Rate Limiting
- In-memory rate limiter per IP
- Blogs: 100 req/min
- Search: 50 req/min
- Returns 429 when exceeded

### ✅ Input Validation
- Query length limits
- Type checking
- SQL injection prevention

### ✅ Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: public, s-maxage=...
```

### ✅ Edge Runtime
- Faster response times
- Global distribution
- Lower latency

### ✅ Caching Strategy
- Blogs list: 5 min cache
- Search: 3 min cache
- Blog detail: 10 min cache
- Stale-while-revalidate for better UX

---

## Android Integration

### AuthApi.kt Methods

```kotlin
// Fetch blogs
suspend fun getBlogs(limit: Int = 20, offset: Int = 0): List<Blog>

// Search blogs
suspend fun searchBlogs(query: String): List<SearchResult>
```

### Data Classes

```kotlin
data class Blog(
    val id: String,
    val title: String,
    val description: String?,
    val slug: String,
    val createdAt: String,
    val readTime: Int
)

data class SearchResult(
    val id: String,
    val title: String,
    val description: String?,
    val slug: String
)
```

### Fragment Implementation

**BlogsFragment:**
- Loads blogs on view creation
- Displays in RecyclerView
- Shows title, description, read time

**SearchFragment:**
- Real-time search with 300ms debounce
- Displays results in RecyclerView
- Minimum 2 characters to search

---

## Database Schema

Added to `/src/lib/schema.ts`:

```typescript
export const blogs = pgTable("blogs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
})

export const blogFeedback = pgTable("blog_feedback", {
  id: text("id").primaryKey(),
  blogId: text("blogId").notNull().references(() => blogs.id),
  userId: text("userId"),
  liked: boolean("liked").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow()
})
```

---

## Performance Optimizations

1. **Edge Runtime** - Deployed globally for low latency
2. **Aggressive Caching** - Reduces database load
3. **Pagination** - Limits data transfer
4. **Indexed Queries** - Fast database lookups
5. **Rate Limiting** - Prevents abuse

---

## Testing

### Test Blogs API
```bash
curl https://blazeneuro.com/api/mobile/blogs?limit=10
```

### Test Search API
```bash
curl "https://blazeneuro.com/api/mobile/search?q=test"
```

### Test Blog Detail
```bash
curl https://blazeneuro.com/api/mobile/blogs/my-blog-slug
```

---

## Next Steps

1. **Add Authentication** - Require auth token for certain endpoints
2. **Add Analytics** - Track API usage
3. **Add Pagination Metadata** - Total count, pages
4. **Add Filtering** - By date, category, tags
5. **Add Sorting** - By date, popularity, relevance
6. **Add Blog Creation API** - For admin users
7. **Add Comments API** - User engagement

---

## Files Created/Modified

### Backend (Next.js)
- `/src/app/api/mobile/blogs/route.ts` - Blogs list API
- `/src/app/api/mobile/search/route.ts` - Search API
- `/src/app/api/mobile/blogs/[slug]/route.ts` - Blog detail API
- `/src/lib/schema.ts` - Added blogs table

### Android
- `/android/app/src/main/java/com/blazeneuro/AuthApi.kt` - Added API methods
- `/android/app/src/main/java/com/blazeneuro/HomeActivity.kt` - Integrated APIs
- `/android/app/src/main/res/layout/fragment_search.xml` - Added RecyclerView

---

## Security Checklist

✅ Rate limiting per IP
✅ Input validation
✅ SQL injection prevention (Drizzle ORM)
✅ Security headers
✅ Edge runtime
✅ Caching strategy
✅ Error handling
✅ No sensitive data exposure
✅ HTTPS only
✅ CORS configured

The API system is **production-ready** and optimized for mobile! 🚀
