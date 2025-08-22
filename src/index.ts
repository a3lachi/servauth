import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { timing } from "hono/timing";
import { secureHeaders } from "hono/secure-headers";
import authRoutes from "./routes/auth";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", timing());
app.use("*", secureHeaders());

// CORS - using Hono's built-in cors middleware
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"];
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return origin;
      }
      return allowedOrigins[0]; // Default to first allowed origin
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
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

// Routes
app.route("/auth", authRoutes);

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