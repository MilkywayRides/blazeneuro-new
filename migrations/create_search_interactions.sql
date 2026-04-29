CREATE TABLE IF NOT EXISTS search_interactions (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  result_id TEXT NOT NULL,
  result_title TEXT,
  result_description TEXT,
  clicked BOOLEAN DEFAULT FALSE,
  position INTEGER,
  ai_score REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_query ON search_interactions(query);
CREATE INDEX idx_created_at ON search_interactions(created_at);
