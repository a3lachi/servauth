// src/index.ts - Complete working solution
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

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

// Health check
app.get("/", (c) => {
  return c.json({
    status: "healthy",
    service: "auth-server",
    timestamp: new Date().toISOString(),
  });
});

// Better-Auth native endpoints - these handle cookies properly
app.all("/api/auth/*", async (c) => {
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

// Custom authentication endpoints that wrap Better-Auth
app.post("/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    
    // Call Better-Auth's sign-up through its handler
    const request = new Request(`${c.req.url.replace('/auth/register', '/api/auth/sign-up/email')}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        name: body.name,
      }),
    });
    
    const response = await auth.handler(request);
    const data = await response.json();
    
    if (response.status >= 400) {
      return c.json({ error: data.error || "Registration failed" }, response.status);
    }
    
    return c.json({
      message: "Registration successful",
      user: data.user,
    }, 201);
  } catch (error: any) {
    console.error("Registration error:", error);
    return c.json({ error: error.message || "Registration failed" }, 500);
  }
});

app.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    
    // Call Better-Auth's sign-in through its handler
    const request = new Request(`${c.req.url.replace('/auth/login', '/api/auth/sign-in/email')}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });
    
    const response = await auth.handler(request);
    
    // Forward the Set-Cookie header from Better-Auth
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      c.header("set-cookie", setCookie);
    }
    
    const data = await response.json();
    
    if (response.status >= 400) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    return c.json({
      message: "Login successful",
      user: data.user,
      session: data.session,
    }, 200);
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ error: error.message || "Login failed" }, 500);
  }
});

app.post("/auth/logout", async (c) => {
  try {
    // Forward the request to Better-Auth's sign-out
    const request = new Request(`${c.req.url.replace('/auth/logout', '/api/auth/sign-out')}`, {
      method: "POST",
      headers: c.req.raw.headers,
    });
    
    const response = await auth.handler(request);
    
    // Forward the Set-Cookie header to clear the session
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      c.header("set-cookie", setCookie);
    }
    
    return c.json({ message: "Logout successful" });
  } catch (error: any) {
    console.error("Logout error:", error);
    return c.json({ error: error.message || "Logout failed" }, 500);
  }
});

app.get("/auth/me", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    
    if (!session || !session.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    return c.json({ user: session.user });
  } catch (error: any) {
    console.error("Get user error:", error);
    return c.json({ error: "Failed to get user" }, 401);
  }
});

app.put("/auth/me", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    
    if (!session || !session.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const body = await c.req.json();
    const updates: any = {};
    
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      
      await db
        .update(users)
        .set(updates)
        .where(eq(users.id, session.user.id));
    }
    
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    
    return c.json({ user: updatedUser[0] });
  } catch (error: any) {
    console.error("Update user error:", error);
    return c.json({ error: error.message || "Failed to update user" }, 500);
  }
});

app.delete("/auth/me", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    
    if (!session || !session.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    await db.delete(users).where(eq(users.id, session.user.id));
    
    // Clear the session
    const request = new Request(`${c.req.url.replace('/auth/me', '/api/auth/sign-out')}`, {
      method: "POST",
      headers: c.req.raw.headers,
    });
    
    const response = await auth.handler(request);
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      c.header("set-cookie", setCookie);
    }
    
    return c.json({ message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return c.json({ error: error.message || "Failed to delete account" }, 500);
  }
});

app.post("/auth/refresh", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    
    if (!session) {
      return c.json({ error: "No active session" }, 401);
    }
    
    return c.json({
      user: session.user,
      session: session.session,
    });
  } catch (error: any) {
    console.error("Refresh error:", error);
    return c.json({ error: error.message || "Session refresh failed" }, 500);
  }
});

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