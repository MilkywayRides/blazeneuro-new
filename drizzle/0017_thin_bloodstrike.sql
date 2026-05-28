CREATE TABLE "admin_dashboard_layout" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"config" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "publisher_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "admin_dashboard_layout" ADD CONSTRAINT "admin_dashboard_layout_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;