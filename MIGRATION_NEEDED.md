# Database Migration Required

## Run this SQL on your production database:

```sql
CREATE TABLE "community_post" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"dislikes" integer DEFAULT 0 NOT NULL,
	"reply_to_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "community_post" ADD CONSTRAINT "community_post_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "community_post" ADD CONSTRAINT "community_post_reply_to_id_community_post_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."community_post"("id") ON DELETE no action ON UPDATE no action;
```

## How to run:

1. Go to your database provider (Neon/Vercel Postgres)
2. Open SQL editor
3. Paste and execute the SQL above
4. Refresh your app

OR use Drizzle CLI:
```bash
export DATABASE_URL="your-production-db-url"
npm run db:push
```
