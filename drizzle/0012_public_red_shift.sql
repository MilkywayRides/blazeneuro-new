CREATE TABLE "deviceLocation" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"deviceId" text NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"lastSeen" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deviceLocation" ADD CONSTRAINT "deviceLocation_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;