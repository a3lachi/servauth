// src/routes/health.ts - Health check routes
import { Hono } from "hono";

const healthRoutes = new Hono();

// Health check
healthRoutes.get("/", (c) => {
  return c.json({
    status: "healthy",
    service: "auth-server",
    timestamp: new Date().toISOString(),
  });
});

export { healthRoutes };