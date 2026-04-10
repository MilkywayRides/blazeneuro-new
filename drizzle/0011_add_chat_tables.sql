-- Add chat tables
CREATE TABLE IF NOT EXISTS "chat_message" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "content" text NOT NULL,
  "image_url" text,
  "reply_to_id" text REFERENCES "chat_message"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "chat_mention" (
  "id" text PRIMARY KEY NOT NULL,
  "message_id" text NOT NULL REFERENCES "chat_message"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "push_token" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "token" text NOT NULL UNIQUE,
  "platform" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "chat_message_user_id_idx" ON "chat_message"("user_id");
CREATE INDEX IF NOT EXISTS "chat_message_created_at_idx" ON "chat_message"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "chat_mention_message_id_idx" ON "chat_mention"("message_id");
CREATE INDEX IF NOT EXISTS "chat_mention_user_id_idx" ON "chat_mention"("user_id");
CREATE INDEX IF NOT EXISTS "push_token_user_id_idx" ON "push_token"("user_id");
