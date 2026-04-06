CREATE TABLE "blogFeedback" (
	"id" text PRIMARY KEY NOT NULL,
	"blogId" text NOT NULL,
	"userId" text,
	"liked" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog" ADD COLUMN "coverImage" text;--> statement-breakpoint
ALTER TABLE "blogFeedback" ADD CONSTRAINT "blogFeedback_blogId_blog_id_fk" FOREIGN KEY ("blogId") REFERENCES "public"."blog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogFeedback" ADD CONSTRAINT "blogFeedback_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;