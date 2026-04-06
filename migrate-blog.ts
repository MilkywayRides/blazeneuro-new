import { db } from "./src/lib/db";
import { sql } from "drizzle-orm";

async function migrate() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "blog" (
        "id" text PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "slug" text NOT NULL,
        "content" text NOT NULL,
        "excerpt" text,
        "published" boolean DEFAULT false NOT NULL,
        "authorId" text NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "blog_slug_unique" UNIQUE("slug")
      );
    `);

    await db.execute(sql`
      ALTER TABLE "blog" ADD CONSTRAINT "blog_authorId_user_id_fk" 
      FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") 
      ON DELETE no action ON UPDATE no action;
    `);

    console.log("✓ Blog table created successfully");
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("✓ Blog table already exists");
    } else {
      console.error("Migration failed:", error);
    }
  }
  process.exit(0);
}

migrate();
