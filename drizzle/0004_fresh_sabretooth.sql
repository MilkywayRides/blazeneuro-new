CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;