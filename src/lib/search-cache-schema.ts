import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const blogSearchCache = pgTable("blogSearchCache", {
  id: text("id").primaryKey(),
  query: text("query").notNull().unique(),
  keywords: text("keywords").array().notNull(),
  blogIds: text("blogIds").array().notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow()
})
