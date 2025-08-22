// src/index.ts - Main server file
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes } from "./routes/auth";
import { betterAuthRoutes } from "./routes/better-auth";
import { healthRoutes } from "./routes/health";

const app = new Hono();

// Middleware
app.use("*", logger());

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Routes
app.route("/", healthRoutes);
app.route("/", betterAuthRoutes);
app.route("/", authRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = parseInt(process.env.PORT || "3000");
console.log(`🚀 Server running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};