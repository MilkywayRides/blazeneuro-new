CREATE TABLE IF NOT EXISTS "search_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"last_searched" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "search_queries_query_idx" ON "search_queries" ("query");
CREATE INDEX IF NOT EXISTS "search_queries_count_idx" ON "search_queries" ("count" DESC);
