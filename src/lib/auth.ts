import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import { schema } from "./schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/callback/google`
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      redirectURI: `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/callback/github`
    }
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://blazeneuro.com",
    "https://auth.blazeneuro.com",
    "https://www.blazeneuro.com"
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.blazeneuro.com",
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    cookieSameSite: "lax",
    generateId: () => crypto.randomUUID(),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: true
      }
    }
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
})
