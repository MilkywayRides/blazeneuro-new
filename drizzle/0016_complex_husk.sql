CREATE TABLE "course_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"publisher_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_follows_user_id_publisher_id_unique" UNIQUE("user_id","publisher_id")
);
--> statement-breakpoint
ALTER TABLE "course_page_reactions" DROP CONSTRAINT IF EXISTS "course_page_reactions_user_id_page_id_pk";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "description" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "publisher_id" text;--> statement-breakpoint
ALTER TABLE "course_follows" ADD CONSTRAINT "course_follows_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_follows" ADD CONSTRAINT "course_follows_publisher_id_user_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_publisher_id_user_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "course_page_reactions" ADD CONSTRAINT "course_page_reactions_user_id_page_id_unique" UNIQUE("user_id","page_id");