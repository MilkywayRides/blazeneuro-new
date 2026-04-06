CREATE TABLE "database" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"userId" text NOT NULL,
	"schemaName" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"region" text DEFAULT 'us-east-1' NOT NULL,
	"connectionString" text NOT NULL,
	"maxConnections" text DEFAULT '100',
	"storageUsed" text DEFAULT '0',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "database_schemaName_unique" UNIQUE("schemaName")
);
--> statement-breakpoint
CREATE TABLE "databaseBranch" (
	"id" text PRIMARY KEY NOT NULL,
	"databaseId" text NOT NULL,
	"name" text NOT NULL,
	"schemaName" text NOT NULL,
	"parentBranchId" text,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "database" ADD CONSTRAINT "database_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "databaseBranch" ADD CONSTRAINT "databaseBranch_databaseId_database_id_fk" FOREIGN KEY ("databaseId") REFERENCES "public"."database"("id") ON DELETE no action ON UPDATE no action;