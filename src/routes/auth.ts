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
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
      asResponse: true,
    });

    if (!result.ok) {
      const error = await result.json();
      return c.json({ error: error.message || "Registration failed" }, 400);
    }

    const response = await result.json();
    return c.json({
      message: "Registration successful",
      user: response.user,
    }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Registration failed" }, 500);
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
      asResponse: true,
    });

    if (!result.ok) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const response = await result.json();
    
    // Set cookie headers
    const cookieHeader = result.headers.get("set-cookie");
    if (cookieHeader) {
      c.header("set-cookie", cookieHeader);
    }

    return c.json({
      message: "Login successful",
      user: response.user,
      session: response.session,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Logout
authRoutes.post("/logout", requireAuth, async (c) => {
  try {
    await auth.api.signOut({
      headers: c.req.raw.headers,
    });

    return c.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ error: "Logout failed" }, 500);
  }
});

// Refresh session
authRoutes.post("/refresh", async (c) => {
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
  } catch (error) {
    console.error("Refresh error:", error);
    return c.json({ error: "Session refresh failed" }, 500);
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
  } catch (error) {
    console.error("Update user error:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

// Delete current user
authRoutes.delete("/me", requireAuth, async (c) => {
  const user = c.get("user");
  
  try {
    await db.delete(users).where(eq(users.id, user.id));
    
    return c.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ error: "Failed to delete account" }, 500);
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
  } catch (error) {
    console.error("Password reset error:", error);
    return c.json({ error: "Failed to process password reset" }, 500);
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

    if (!result.ok) {
      return c.json({ error: "Invalid or expired token" }, 400);
    }

    return c.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    return c.json({ error: "Failed to reset password" }, 500);
  }
});

export default authRoutes;