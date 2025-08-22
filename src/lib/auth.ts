// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false, // Don't auto sign-in after registration
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieName: "better-auth.session_token",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // Set to false for local development
      path: "/",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-at-least-32-characters-long-for-security",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
});