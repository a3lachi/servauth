// src/index-alternative.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    status: "healthy",
    service: "auth-server",
    timestamp: new Date().toISOString(),
  });
});

// Mount Better-Auth directly
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Custom endpoints that use Better-Auth
app.get("/auth/me", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  return c.json({ user: session.user });
});

const port = parseInt(process.env.PORT || "3000");
console.log(`🚀 Server running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};