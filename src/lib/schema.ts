import { pgTable, text, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  phone: text("phone"),
  phoneVerified: boolean("phoneVerified").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id)
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
})

export const oauthApp = pgTable("oauthApp", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  clientId: text("clientId").notNull().unique(),
  clientSecret: text("clientSecret").notNull(),
  homepageUrl: text("homepageUrl").notNull(),
  description: text("description"),
  callbackUrl: text("callbackUrl").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
})

export const oauthAuthorization = pgTable("oauthAuthorization", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  userId: text("userId").notNull().references(() => user.id),
  appId: text("appId").notNull().references(() => oauthApp.id),
  scope: text("scope").notNull(),
  redirectUri: text("redirectUri").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow()
})

export const oauthToken = pgTable("oauthToken", {
  id: text("id").primaryKey(),
  accessToken: text("accessToken").notNull().unique(),
  refreshToken: text("refreshToken").unique(),
  userId: text("userId").notNull().references(() => user.id),
  appId: text("appId").notNull().references(() => oauthApp.id),
  scope: text("scope").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow()
})

export const blog = pgTable("blog", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("coverImage"),
  searchKeywords: text("searchKeywords").array(),
  published: boolean("published").notNull().default(false),
  authorId: text("authorId").notNull().references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
})

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const blogSearchCache = pgTable("blogSearchCache", {
  id: text("id").primaryKey(),
  query: text("query").notNull().unique(),
  keywords: text("keywords").array().notNull(),
  blogIds: text("blogIds").array().notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow()
})


export const blogFeedback = pgTable("blogFeedback", {
  id: text("id").primaryKey(),
  blogId: text("blogId").notNull().references(() => blog.id),
  userId: text("userId").references(() => user.id),
  liked: boolean("liked").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow()
})

export const githubConnection = pgTable("githubConnection", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  githubId: text("githubId").notNull(),
  username: text("username").notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
})

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  githubConnectionId: text("githubConnectionId").references(() => githubConnection.id),
  repoFullName: text("repoFullName"),
  repoUrl: text("repoUrl"),
  branch: text("branch").notNull().default("main"),
  framework: text("framework").notNull().default("nextjs"),
  buildCommand: text("buildCommand").default("npm run build"),
  outputDirectory: text("outputDirectory").default(".next"),
  installCommand: text("installCommand").default("npm install"),
  envVars: text("envVars"),
  domain: text("domain"),
  subdomain: text("subdomain").unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
})

export const deployment = pgTable("deployment", {
  id: text("id").primaryKey(),
  projectId: text("projectId").notNull().references(() => project.id),
  status: text("status").notNull().default("pending"),
  commitSha: text("commitSha"),
  commitMessage: text("commitMessage"),
  branch: text("branch").notNull(),
  buildLogs: text("buildLogs"),
  deployUrl: text("deployUrl"),
  githubRunId: text("githubRunId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  completedAt: timestamp("completedAt")
})

export const database = pgTable("database", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  schemaName: text("schemaName").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  status: text("status").notNull().default("active"),
  region: text("region").notNull().default("us-east-1"),
  connectionString: text("connectionString").notNull(),
  maxConnections: text("maxConnections").default("100"),
  storageUsed: text("storageUsed").default("0"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
})

export const databaseBranch = pgTable("databaseBranch", {
  id: text("id").primaryKey(),
  databaseId: text("databaseId").notNull().references(() => database.id),
  name: text("name").notNull(),
  schemaName: text("schemaName").notNull(),
  connectionString: text("connectionString").notNull(),
  parentBranchId: text("parentBranchId"),
  isDefault: boolean("isDefault").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow()
})

export const adminChatMessage = pgTable("adminChatMessage", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow()
})

export const schema = {
  user,
  session,
  account,
  verification,
  oauthApp,
  oauthAuthorization,
  oauthToken,
  blog,
  blogFeedback,
  notification,
  githubConnection,
  project,
  deployment,
  database,
  databaseBranch,
  adminChatMessage,
  blogSearchCache
}

