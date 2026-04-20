import { pgTable, text, timestamp, jsonb, uuid, boolean } from 'drizzle-orm/pg-core'

export const flows = pgTable('flows', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  nodes: jsonb('nodes').notNull(),
  edges: jsonb('edges').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const blogs = pgTable('blogs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  topic: text('topic').notNull(),
  content: text('content'),
  flowId: uuid('flow_id').references(() => flows.id),
  status: text('status').notNull().default('draft'), // draft, generating, published
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const flowNodes = pgTable('flow_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  flowId: uuid('flow_id').references(() => flows.id).notNull(),
  nodeId: text('node_id').notNull(),
  type: text('type').notNull(),
  label: text('label').notNull(),
  prompt: text('prompt'),
  temperature: text('temperature').default('0.7'),
  position: jsonb('position').notNull(),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
