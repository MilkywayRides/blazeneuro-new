-- Create course_progress table
CREATE TABLE IF NOT EXISTS "course_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "page_id" uuid NOT NULL REFERENCES "course_pages"("id") ON DELETE CASCADE,
  "completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "course_progress_user_id_idx" ON "course_progress"("user_id");
CREATE INDEX IF NOT EXISTS "course_progress_page_id_idx" ON "course_progress"("page_id");
