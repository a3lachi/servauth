import { Context, Next } from "hono";
import { auth } from "../lib/auth";

export async function requireAuth(c: Context, next: Next) {
  try {
    // Create a Request object from the Hono context
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.raw.headers,
    });

    // Get session using Better-Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      console.log("No valid session found");
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Set user and session in context
    c.set("user", session.user);
    c.set("session", session.session);
    
    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json({ error: "Authentication failed" }, 401);
  }
}

export async function optionalAuth(c: Context, next: Next) {
  try {
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.raw.headers,
    });

    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (session && session.user) {
      c.set("user", session.user);
      c.set("session", session.session);
    }
  } catch (error) {
    // Continue without auth
    console.log("Optional auth: No session found");
  }
  
  await next();
}