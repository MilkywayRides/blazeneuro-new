import { db } from "./db";
import { blog, blogSearchCache } from "./schema";
import { sql, or, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { memoryCache } from "./cache";

const AI_MODEL_URL_V2 = process.env.AI_MODEL_URL_V2!;
const AI_API_SECRET = process.env.AI_API_SECRET!;

// Generate search keywords using AI
async function generateSearchKeywords(title: string, content: string, excerpt?: string): Promise<string[]> {
  try {
    // Get all existing blog titles for context
    const existingBlogs = await db.select({ title: blog.title, keywords: blog.searchKeywords })
      .from(blog)
      .where(sql`${blog.searchKeywords} IS NOT NULL`)
      .limit(10);
    
    const context = existingBlogs.map(b => `${b.title}: ${b.keywords?.join(', ')}`).join('\n');

    const response = await fetch(`${AI_MODEL_URL_V2}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_SECRET}`
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Generate 10-15 SEO keywords for this blog. Learn from existing blog patterns:
${context}

New Blog:
Title: ${title}
Excerpt: ${excerpt}
Content: ${content.substring(0, 1500)}

Return ONLY a JSON array of keyword strings that users would search.`
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) return [];
    
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || data.content || data.response || "";
    if (!text) return [];
    
    const keywords = JSON.parse(text.trim().replace(/```json\n?|\n?```/g, ''));
    return keywords || [];
  } catch (error) {
    console.error("Failed to generate keywords:", error);
    return [];
  }
}

// Expand search query using AI
async function expandSearchQuery(query: string): Promise<string[]> {
  try {
    // Get all blog titles and keywords for AI context
    const allBlogs = await db.select({ title: blog.title, keywords: blog.searchKeywords })
      .from(blog)
      .where(sql`${blog.searchKeywords} IS NOT NULL`)
      .limit(20);
    
    const blogContext = allBlogs.map(b => `${b.title}: ${b.keywords?.slice(0, 5).join(', ')}`).join('\n');

    const response = await fetch(`${AI_MODEL_URL_V2}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_SECRET}`
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `User searched: "${query}"

Available blogs:
${blogContext}

Generate 5-8 related search keywords that match available content. Return ONLY a JSON array.`
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) return [query];
    
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || data.content || data.response || "";
    if (!text) return [query];
    
    const keywords = JSON.parse(text.trim().replace(/```json\n?|\n?```/g, ''));
    return keywords && keywords.length > 0 ? keywords : [query];
  } catch (error) {
    console.error("Failed to expand query:", error);
    return [query];
  }
}


function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildWordBoundaryRegex(term: string): string {
  const normalized = term.trim().toLowerCase().replace(/\s+/g, " ");
  return `\\m${escapeRegex(normalized).replace(/ /g, "\\s+")}\\M`;
}

function extractQueryTerms(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9_-]/g, ""))
    .filter((token) => token.length >= 2);
}

function buildSearchPredicate(searchInput: string) {
  const normalized = searchInput.toLowerCase().trim();
  const terms = extractQueryTerms(normalized);
  const patterns = [buildWordBoundaryRegex(normalized), ...terms.map(buildWordBoundaryRegex)];
  return or(
    ...patterns.map((pattern) =>
      or(
        sql`LOWER(${blog.title}) ~ ${pattern}`,
        sql`LOWER(${blog.excerpt}) ~ ${pattern}`,
        sql`LOWER(${blog.content}) ~ ${pattern}`,
        sql`EXISTS (SELECT 1 FROM unnest(COALESCE(${blog.searchKeywords}, ARRAY[]::text[])) kw WHERE LOWER(kw) ~ ${pattern})`
      )
    )
  );
}
// Search blogs with AI-powered keyword matching
export async function searchBlogs(query: string): Promise<(typeof blog.$inferSelect)[]> {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check memory cache first (fastest)
  const memCached = memoryCache.get(`search:${normalizedQuery}`);
  if (memCached) return memCached;

  // Step 1: Check database cache
  const cached = await db.select()
    .from(blogSearchCache)
    .where(sql`LOWER(${blogSearchCache.query}) = ${normalizedQuery}`)
    .limit(1);

  if (cached.length > 0 && cached[0].blogIds.length > 0) {
    const blogs = await db.select()
      .from(blog)
      .where(inArray(blog.id, cached[0].blogIds));
    
    // Cache in memory for 5 minutes
    memoryCache.set(`search:${normalizedQuery}`, blogs, 300);
    return blogs;
  }

  // Step 2: Direct search (title, content, excerpt, keywords)
  const directResults = await db.select()
    .from(blog)
    .where(buildSearchPredicate(normalizedQuery));

  if (directResults.length > 0) {
    // Cache the results
    await db.insert(blogSearchCache).values({
      id: nanoid(),
      query: normalizedQuery,
      keywords: [normalizedQuery],
      blogIds: directResults.map(b => b.id)
    }).onConflictDoNothing();

    return directResults;
  }

  // Step 3: No results - Use AI to expand query
  const expandedKeywords = await expandSearchQuery(normalizedQuery);
  
  // Search with expanded keywords
  const expandedResults = await db.select()
    .from(blog)
    .where(
      or(
        ...expandedKeywords.map((keyword) => buildSearchPredicate(keyword))
      )
    );

  // Cache expanded search
  await db.insert(blogSearchCache).values({
    id: nanoid(),
    query: normalizedQuery,
    keywords: expandedKeywords,
    blogIds: expandedResults.map(b => b.id)
  }).onConflictDoNothing();

  return expandedResults;
}

// Generate and update keywords for a blog
export async function updateBlogKeywords(blogId: string) {
  const blogPost = await db.select().from(blog).where(sql`${blog.id} = ${blogId}`).limit(1);
  
  if (blogPost.length === 0) return;

  const keywords = await generateSearchKeywords(
    blogPost[0].title,
    blogPost[0].content,
    blogPost[0].excerpt || undefined
  );

  await db.update(blog)
    .set({ searchKeywords: keywords })
    .where(sql`${blog.id} = ${blogId}`);
}

// Batch generate keywords for all blogs without keywords
export async function generateAllBlogKeywords() {
  const blogsWithoutKeywords = await db.select()
    .from(blog)
    .where(sql`${blog.searchKeywords} IS NULL OR array_length(${blog.searchKeywords}, 1) IS NULL`);

  for (const blogPost of blogsWithoutKeywords) {
    const keywords = await generateSearchKeywords(
      blogPost.title,
      blogPost.content,
      blogPost.excerpt || undefined
    );

    await db.update(blog)
      .set({ searchKeywords: keywords })
      .where(sql`${blog.id} = ${blogPost.id}`);
    
    console.log(`Generated keywords for blog: ${blogPost.title}`);
  }
}
