-- Add table to cache AI scores
CREATE TABLE IF NOT EXISTS ai_score_cache (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  result_id TEXT NOT NULL,
  ai_score REAL NOT NULL,
  trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(query, result_id)
);

CREATE INDEX IF NOT EXISTS idx_score_cache_query ON ai_score_cache(query);
CREATE INDEX IF NOT EXISTS idx_score_cache_result ON ai_score_cache(result_id);
