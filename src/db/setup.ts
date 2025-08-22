// src/db/setup.ts
import { sql } from "drizzle-orm";
import { db } from "./index";

async function setupDatabase() {
  try {
    console.log("🔧 Setting up database tables...");

    // Drop existing tables if they exist (for development only)
    await db.execute(sql`DROP TABLE IF EXISTS verification CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS session CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS account CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "user" CASCADE`);

    // Create user table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" BOOLEAN DEFAULT false,
        "name" TEXT,
        "image" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create account table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        "scope" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create session table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "token" TEXT UNIQUE,
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create verification table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"("userId")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"("userId")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_session_token ON "session"("token")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"("identifier")`);

    console.log("✅ Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.main) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { setupDatabase };