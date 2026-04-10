-- Add like and dislike counts to blog table
ALTER TABLE "blog" ADD COLUMN IF NOT EXISTS "likeCount" integer DEFAULT 0 NOT NULL;
ALTER TABLE "blog" ADD COLUMN IF NOT EXISTS "dislikeCount" integer DEFAULT 0 NOT NULL;

-- Update existing blogs to have 0 counts
UPDATE "blog" SET "likeCount" = 0, "dislikeCount" = 0 WHERE "likeCount" IS NULL OR "dislikeCount" IS NULL;
