# Servauth

A high-performance authentication server built with Bun, Hono, Better-Auth, and Drizzle ORM.

## Features

- 🚀 **Fast**: Built on Bun runtime for maximum performance
- 🔐 **Secure**: Industry-standard authentication with Better-Auth
- 📦 **Type-safe**: Full TypeScript with Drizzle ORM
- ✅ **Validated**: Comprehensive data validation with Zod schemas
- 🐳 **Containerized**: Docker ready for easy deployment
- ⚡ **Lightweight**: Minimal dependencies, maximum efficiency

## Quick Start

### Prerequisites

- Bun 1.0+ or Docker
- PostgreSQL 14+ (or use Docker Compose)

### Local Development
1. Clone the repository:
```bash
git clone https://github.com/a3lachi/servauth.git
cd servauth
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Create Tables
```bash
bun run db:generate      
bun run db:migrate
```

5. Run
```bash
bun run dev
```

## Project Structure

```
servauth/
├── src/
│   ├── db/
│   │   ├── index.ts          # Database connection
│   │   ├── migrate.ts        # Migration runner
│   │   └── schema.ts         # Drizzle schema definitions
│   ├── lib/
│   │   └── auth.ts           # Better-Auth configuration
│   ├── routes/
│   │   ├── auth.ts           # Authentication endpoints
│   │   ├── better-auth.ts    # Better-Auth native endpoints
│   │   └── health.ts         # Health check endpoint
│   ├── types/
│   │   └── index.ts          # Zod validation schemas & TypeScript types
│   ├── tests/
│   │   └── auth.test.ts      # Authentication tests
│   └── index.ts              # Main server file
├── docker/
│   └── Dockerfile            # Docker container configuration
├── docker-compose.yml        # Docker services orchestration
├── drizzle.config.ts         # Drizzle ORM configuration
└── package.json              # Dependencies and scripts
```

## Tech Stack

Runtime: Bun

Language: TypeScript

Web Framework: Hono

Auth: Better-Auth

Validation: Zod

ORM: Drizzle ORM

Database: PostgreSQL (default)

Containerization: Docker & Docker Compose

Testing: Vitest (preferred for Bun)

## Functional Requirements

### Authentication

✅ User registration (email + password)

✅ User login (session or JWT)

✅ Password reset (token-based)

✅ Session management (refresh tokens or cookie-based sessions)

✅ Logout

### User Management

✅ Fetch current user profile (/me)

✅ Update user details (username, email)

✅ Delete account

### Security

✅ Passwords stored with hashing (Argon2 or bcrypt)

✅ CSRF protection

✅ Input validation & sanitization (Zod schemas)

✅ CORS support

✅ Type-safe request/response validation

✅ Detailed error messages for better UX


## API Endpoints

| Method | Endpoint              | Description              | Auth Required |
|--------|-----------------------|--------------------------|---------------|
| POST   | `/auth/register`      | Register a new user      | ❌ |
| POST   | `/auth/login`         | Login user               | ❌ |
| POST   | `/auth/logout`        | Logout user              | ✅ |
| POST   | `/auth/refresh`       | Refresh session          | ✅ |
| GET    | `/auth/me`            | Get current user         | ✅ |
| PUT    | `/auth/me`            | Update user info         | ✅ |
| DELETE | `/auth/me`            | Delete account           | ✅ |
| POST   | `/auth/forgot-password` | Request password reset  | ❌ |
| POST   | `/auth/reset-password`  | Reset password with token | ❌ |

## Data Validation

The API uses [Zod](https://zod.dev/) for comprehensive data validation, ensuring all inputs are properly validated before processing.

### Validation Features

- 📧 **Email validation**: Proper email format checking with length limits
- 🔒 **Password strength**: Enforces strong passwords with complexity requirements
- 👤 **Name validation**: Character restrictions and length limits
- 🛡️ **Type safety**: Runtime validation with TypeScript type inference
- 📝 **Detailed error messages**: User-friendly validation feedback

### Validation Rules

#### Registration (`POST /auth/register`)
```typescript
{
  email: string,    // Valid email format, max 254 characters
  password: string, // Min 8 chars, must contain uppercase, lowercase, and number
  name: string      // Required, letters/spaces/hyphens/apostrophes only, max 100 chars
}
```

#### Login (`POST /auth/login`)
```typescript
{
  email: string,    // Valid email format
  password: string  // Required, any length
}
```

#### Profile Update (`PUT /auth/me`)
```typescript
{
  name?: string,    // Optional, same rules as registration
  email?: string    // Optional, valid email format
}
```
*Note: At least one field must be provided*

### Validation Response Format

#### Success Response
```json
{
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Validation Error Response
```json
{
  "error": "Validation failed",
  "details": [
    "email: Invalid email format",
    "password: Password must be at least 8 characters",
    "password: Password must contain at least one lowercase letter, one uppercase letter, and one number",
    "name: Name can only contain letters, spaces, hyphens, and apostrophes"
  ]
}
```

#### JSON Parse Error Response
```json
{
  "error": "Invalid JSON format",
  "details": [
    "Request body must be valid JSON"
  ]
}
```

### Password Requirements

- **Minimum length**: 8 characters
- **Maximum length**: 128 characters  
- **Required characters**:
  - At least one lowercase letter (a-z)
  - At least one uppercase letter (A-Z)
  - At least one number (0-9)

### Example Validation Scenarios

#### Valid Registration Request
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

#### Invalid Email Format
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email-format",
    "password": "SecurePass123", 
    "name": "John Doe"
  }'

# Response:
{
  "error": "Validation failed",
  "details": [
    "email: Invalid email format"
  ]
}
```

#### Weak Password
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "weak",
    "name": "John Doe"
  }'

# Response:
{
  "error": "Validation failed", 
  "details": [
    "password: Password must be at least 8 characters",
    "password: Password must contain at least one lowercase letter, one uppercase letter, and one number"
  ]
}
```

## Database Schema

The application uses PostgreSQL with the following main tables:

users - User accounts

accounts - Authentication providers

sessions - Active user sessions

verifications - Email/token verifications


## 8. Architecture

API Layer: Hono routes

Auth Layer: Better-Auth middleware

Database Layer: Drizzle ORM for migrations & queries

Deployment: Docker (Bun app + PostgreSQL container)

## 9. Deployment
Docker setup

Dockerfile: Build Bun app

docker-compose.yml: Run Bun + PostgreSQL together

Environment variables for DB connection, JWT secret, etc.

## 10. Success Metrics

✅ API responds within <200ms for 95% of requests

✅ Authentication is secure against OWASP Top 10 vulnerabilities

✅ Server scales to 10k concurrent connections with Bun’s event loop

✅ Developer onboarding takes <10 minutes with docker-compose up


