-- Query to view most searched topics
-- Run this on your production database to see trending searches

-- Top 10 most searched terms
SELECT 
    query,
    count,
    last_searched,
    created_at
FROM search_queries
ORDER BY count DESC
LIMIT 10;

-- Recent searches (last 24 hours)
SELECT 
    query,
    count,
    last_searched
FROM search_queries
WHERE last_searched > NOW() - INTERVAL '24 hours'
ORDER BY count DESC
LIMIT 10;

-- Search trends over time
SELECT 
    DATE(last_searched) as date,
    query,
    count
FROM search_queries
WHERE last_searched > NOW() - INTERVAL '7 days'
ORDER BY date DESC, count DESC;

-- Total unique searches
SELECT COUNT(*) as unique_searches FROM search_queries;

-- Total search volume
SELECT SUM(count) as total_searches FROM search_queries;

-- Average searches per term
SELECT AVG(count) as avg_searches_per_term FROM search_queries;
