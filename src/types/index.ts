// src/types/index.ts - Zod schemas for data validation
import { z } from "zod";

// ===== Base Schemas =====

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required")
  .max(254, "Email is too long");

// Password validation  
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number"
  );

// Name validation
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name is too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

// ID validation
export const idSchema = z
  .string()
  .min(1, "ID is required")
  .max(255, "ID is too long");

// ===== Authentication Request Schemas =====

// User registration
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

// User login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// User profile update
export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
}).refine(
  (data) => data.name !== undefined || data.email !== undefined,
  {
    message: "At least one field (name or email) must be provided",
    path: ["name", "email"],
  }
);

// ===== Database Model Schemas =====

// User model (matches database schema)
export const userSchema = z.object({
  id: idSchema,
  email: emailSchema,
  emailVerified: z.boolean().default(false),
  name: z.string().nullable(),
  image: z.string().url().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Session model
export const sessionSchema = z.object({
  id: idSchema,
  token: z.string().nullable(),
  expiresAt: z.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Account model
export const accountSchema = z.object({
  id: idSchema,
  userId: idSchema,
  accountId: z.string(),
  providerId: z.string(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  accessTokenExpiresAt: z.date().nullable(),
  refreshTokenExpiresAt: z.date().nullable(),
  scope: z.string().nullable(),
  password: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Verification model
export const verificationSchema = z.object({
  id: idSchema,
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.date(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

// ===== API Response Schemas =====

// Success response wrapper
export const successResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    message: z.string(),
    data: dataSchema.optional(),
  });

// Error response
export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.string()).optional(),
});

// Registration response
export const registerResponseSchema = z.object({
  message: z.string(),
  user: userSchema,
});

// Login response
export const loginResponseSchema = z.object({
  message: z.string(),
  user: userSchema,
  session: sessionSchema,
});

// User profile response
export const userResponseSchema = z.object({
  user: userSchema,
});

// Logout response
export const logoutResponseSchema = z.object({
  message: z.string(),
});

// ===== Query Parameter Schemas =====

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
});

// Sorting
export const sortSchema = z.object({
  sortBy: z.enum(["createdAt", "updatedAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ===== Type Exports =====

// Infer TypeScript types from Zod schemas
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Account = z.infer<typeof accountSchema>;
export type Verification = z.infer<typeof verificationSchema>;

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type SortQuery = z.infer<typeof sortSchema>;

// ===== Validation Helper Functions =====

// Validate request body
export const validateRequestBody = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  );
  
  return { success: false, errors };
};

// Validate query parameters
export const validateQueryParams = <T>(schema: z.ZodSchema<T>, data: Record<string, string | string[]>): { success: true; data: T } | { success: false; errors: string[] } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  );
  
  return { success: false, errors };
};

// Transform database model to API response
export const transformUserResponse = (user: any): User => {
  return userSchema.parse({
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt),
  });
};

export const transformSessionResponse = (session: any): Session => {
  return sessionSchema.parse({
    ...session,
    expiresAt: session.expiresAt instanceof Date ? session.expiresAt : new Date(session.expiresAt),
    createdAt: session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt),
    updatedAt: session.updatedAt instanceof Date ? session.updatedAt : new Date(session.updatedAt),
  });
};