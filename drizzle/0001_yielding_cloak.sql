CREATE TABLE "oauthApp" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"clientId" text NOT NULL,
	"clientSecret" text NOT NULL,
	"homepageUrl" text NOT NULL,
	"description" text,
	"callbackUrl" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauthApp_clientId_unique" UNIQUE("clientId")
);
--> statement-breakpoint
CREATE TABLE "oauthAuthorization" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"userId" text NOT NULL,
	"appId" text NOT NULL,
	"scope" text NOT NULL,
	"redirectUri" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauthAuthorization_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "oauthToken" (
	"id" text PRIMARY KEY NOT NULL,
	"accessToken" text NOT NULL,
	"refreshToken" text,
	"userId" text NOT NULL,
	"appId" text NOT NULL,
	"scope" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauthToken_accessToken_unique" UNIQUE("accessToken"),
	CONSTRAINT "oauthToken_refreshToken_unique" UNIQUE("refreshToken")
);
--> statement-breakpoint
ALTER TABLE "oauthApp" ADD CONSTRAINT "oauthApp_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthAuthorization" ADD CONSTRAINT "oauthAuthorization_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthAuthorization" ADD CONSTRAINT "oauthAuthorization_appId_oauthApp_id_fk" FOREIGN KEY ("appId") REFERENCES "public"."oauthApp"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthToken" ADD CONSTRAINT "oauthToken_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthToken" ADD CONSTRAINT "oauthToken_appId_oauthApp_id_fk" FOREIGN KEY ("appId") REFERENCES "public"."oauthApp"("id") ON DELETE no action ON UPDATE no action;