import { Context, Next } from "hono";
import { z } from "zod";

export function validate<T extends z.ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      c.set("validatedData", validated);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            error: "Validation failed",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          400
        );
      }
      return c.json({ error: "Invalid request body" }, 400);
    }
  };
}