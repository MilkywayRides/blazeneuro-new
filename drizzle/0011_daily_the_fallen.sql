CREATE TABLE "chat_mention" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_message" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"reply_to_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_post" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"dislikes" integer DEFAULT 0 NOT NULL,
	"reply_to_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"platform" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "search_queries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "search_queries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"query" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"last_searched" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog" ADD COLUMN "likeCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog" ADD COLUMN "dislikeCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phoneVerified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_mention" ADD CONSTRAINT "chat_mention_message_id_chat_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_mention" ADD CONSTRAINT "chat_mention_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_reply_to_id_chat_message_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."chat_message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_post" ADD CONSTRAINT "community_post_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_post" ADD CONSTRAINT "community_post_reply_to_id_community_post_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."community_post"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_token" ADD CONSTRAINT "push_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;