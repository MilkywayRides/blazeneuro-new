ALTER TABLE "course_page_reactions" ADD CONSTRAINT "course_page_reactions_user_id_page_id_pk" PRIMARY KEY("user_id","page_id");--> statement-breakpoint
ALTER TABLE "course_pages" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "course_pages" ADD COLUMN "dislike_count" integer DEFAULT 0 NOT NULL;