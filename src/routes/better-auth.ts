// src/routes/better-auth.ts - Better-Auth native endpoints
import { Hono } from "hono";
import { auth } from "../lib/auth";

const betterAuthRoutes = new Hono();

// Better-Auth native endpoints - these handle cookies properly
betterAuthRoutes.all("/api/auth/*", async (c) => {
  const response = await auth.handler(c.req.raw);
  
  // Forward all headers from Better-Auth, especially Set-Cookie
  response.headers.forEach((value, key) => {
    c.header(key, value);
  });
  
  // Return the response body
  const body = await response.text();
  return c.body(body, response.status as any, {
    "Content-Type": response.headers.get("Content-Type") || "application/json",
  });
});

export { betterAuthRoutes };