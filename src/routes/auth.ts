import { Hono } from "hono";
import { auth } from "../lib/auth";
import { validate } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { RegisterSchema, LoginSchema, ResetPasswordSchema, NewPasswordSchema } from "../types";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const authRoutes = new Hono();

// Register
authRoutes.post("/register", validate(RegisterSchema), async (c) => {
  const data = c.get("validatedData");
  
  try {
    console.log("kjhgfghjk"); // Debug log from your test
    
    // Create a proper request for Better-Auth
    const request = new Request(`${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
      }),
    });

    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });

    if (!result || result.error) {
      return c.json({ 
        error: result?.error || "Registration failed" 
      }, 400);
    }

    return c.json({
      message: "Registration successful",
      user: result.user,
    }, 201);
  } catch (error: any) {
    console.error("Registration error:", error);
    return c.json({ 
      error: error.message || "Registration failed" 
    }, 500);
  }
});

// Login
authRoutes.post("/login", validate(LoginSchema), async (c) => {
  const data = c.get("validatedData");
  
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });

    if (!result || result.error) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Set the session cookie properly
    if (result.headers) {
      // Better-Auth returns headers we need to forward
      result.headers.forEach((value: string, key: string) => {
        if (key.toLowerCase() === 'set-cookie') {
          c.header('set-cookie', value);
        }
      });
    } else if (result.session) {
      // Manually create cookie if Better-Auth doesn't provide headers
      const cookieOptions = [
        `better-auth.session_token=${result.session.token}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${60 * 60 * 24 * 7}` // 7 days
      ].join('; ');
      
      c.header('set-cookie', cookieOptions);
    }

    return c.json({
      message: "Login successful",
      user: result.user,
      session: result.session,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ 
      error: error.message || "Login failed" 
    }, 500);
  }
});

// Logout
authRoutes.post("/logout", requireAuth, async (c) => {
  try {
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.raw.headers,
    });

    await auth.api.signOut({
      headers: request.headers,
    });

    // Clear the session cookie
    c.header('set-cookie', 'better-auth.session_token=; Path=/; HttpOnly; Max-Age=0');

    return c.json({ message: "Logout successful" });
  } catch (error: any) {
    console.error("Logout error:", error);
    return c.json({ 
      error: error.message || "Logout failed" 
    }, 500);
  }
});

// Refresh session
authRoutes.post("/refresh", async (c) => {
  try {
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.raw.headers,
    });

    const session = await auth.api.getSession({
      headers: request.headers,
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
    return c.json({ 
      error: error.message || "Session refresh failed" 
    }, 500);
  }
});

// Get current user
authRoutes.get("/me", requireAuth, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

// Update current user
authRoutes.put("/me", requireAuth, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  try {
    const updates: any = {};
    
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      
      await db
        .update(users)
        .set(updates)
        .where(eq(users.id, user.id));
    }
    
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    
    return c.json({ user: updatedUser[0] });
  } catch (error: any) {
    console.error("Update user error:", error);
    return c.json({ 
      error: error.message || "Failed to update user" 
    }, 500);
  }
});

// Delete current user
authRoutes.delete("/me", requireAuth, async (c) => {
  const user = c.get("user");
  
  try {
    await db.delete(users).where(eq(users.id, user.id));
    
    // Clear the session cookie
    c.header('set-cookie', 'better-auth.session_token=; Path=/; HttpOnly; Max-Age=0');
    
    return c.json({ message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return c.json({ 
      error: error.message || "Failed to delete account" 
    }, 500);
  }
});

// Password reset request
authRoutes.post("/forgot-password", validate(ResetPasswordSchema), async (c) => {
  const data = c.get("validatedData");
  
  try {
    const result = await auth.api.forgetPassword({
      body: {
        email: data.email,
        redirectTo: `${process.env.BETTER_AUTH_URL}/auth/reset-password`,
      },
    });

    return c.json({ 
      message: "If an account exists with this email, a password reset link has been sent" 
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return c.json({ 
      error: error.message || "Failed to process password reset" 
    }, 500);
  }
});

// Reset password with token
authRoutes.post("/reset-password", validate(NewPasswordSchema), async (c) => {
  const data = c.get("validatedData");
  
  try {
    const result = await auth.api.resetPassword({
      body: {
        newPassword: data.password,
        token: data.token,
      },
    });

    if (!result || result.error) {
      return c.json({ error: "Invalid or expired token" }, 400);
    }

    return c.json({ message: "Password reset successful" });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return c.json({ 
      error: error.message || "Failed to reset password" 
    }, 500);
  }
});

export default authRoutes;