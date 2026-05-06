-- Create course_progress table
CREATE TABLE IF NOT EXISTS "course_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "page_id" uuid NOT NULL REFERENCES "course_pages"("id") ON DELETE CASCADE,
  "completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS "course_enrollments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "enrolled_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("user_id", "course_id")
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS "course_progress_user_id_idx" ON "course_progress"("user_id");
CREATE INDEX IF NOT EXISTS "course_progress_page_id_idx" ON "course_progress"("page_id");
CREATE INDEX IF NOT EXISTS "course_enrollments_user_id_idx" ON "course_enrollments"("user_id");
CREATE INDEX IF NOT EXISTS "course_enrollments_course_id_idx" ON "course_enrollments"("course_id");
