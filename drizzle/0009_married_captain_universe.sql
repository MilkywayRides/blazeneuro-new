CREATE TABLE "blogSearchCache" (
	"id" text PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"keywords" text[] NOT NULL,
	"blogIds" text[] NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blogSearchCache_query_unique" UNIQUE("query")
);
--> statement-breakpoint
ALTER TABLE "blog" ADD COLUMN "searchKeywords" text[];