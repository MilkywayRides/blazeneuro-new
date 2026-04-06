CREATE TABLE "deployment" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"commitSha" text,
	"commitMessage" text,
	"branch" text NOT NULL,
	"buildLogs" text,
	"deployUrl" text,
	"githubRunId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "githubConnection" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"githubId" text NOT NULL,
	"username" text NOT NULL,
	"accessToken" text NOT NULL,
	"refreshToken" text,
	"avatarUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"userId" text NOT NULL,
	"githubConnectionId" text,
	"repoFullName" text,
	"repoUrl" text,
	"branch" text DEFAULT 'main' NOT NULL,
	"framework" text DEFAULT 'nextjs' NOT NULL,
	"buildCommand" text DEFAULT 'npm run build',
	"outputDirectory" text DEFAULT '.next',
	"installCommand" text DEFAULT 'npm install',
	"envVars" text,
	"domain" text,
	"subdomain" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
ALTER TABLE "deployment" ADD CONSTRAINT "deployment_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "githubConnection" ADD CONSTRAINT "githubConnection_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_githubConnectionId_githubConnection_id_fk" FOREIGN KEY ("githubConnectionId") REFERENCES "public"."githubConnection"("id") ON DELETE no action ON UPDATE no action;