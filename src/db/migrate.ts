import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrationClient } from "./index";

async function runMigrations() {
  try {
    console.log("Connecting to database...");
    console.log("Database URL:", process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'));
    
    const db = drizzle(migrationClient);
    
    console.log("Running migrations...");
    
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    
    console.log("Migrations completed successfully!");
    
    await migrationClient.end();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Migration failed:", error);
    await migrationClient.end();
    process.exit(1);
  }
}

runMigrations().catch((err) => {
  console.error("Migration failed!", err);
  process.exit(1);
});