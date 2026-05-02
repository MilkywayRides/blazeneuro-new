CREATE TABLE IF NOT EXISTS "user_contribution" (
  "id" text PRIMARY KEY NOT NULL,
  "query" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "links" text,
  "tags" text[],
  "contributor_id" text,
  "upvotes" integer DEFAULT 0 NOT NULL,
  "verified" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_user_contribution_query" ON "user_contribution" (LOWER("query"));
