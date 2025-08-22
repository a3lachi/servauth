# Servauth

A high-performance authentication server built with Bun, Hono, Better-Auth, and Drizzle ORM.

## Features

- 🚀 **Fast**: Built on Bun runtime for maximum performance
- 🔐 **Secure**: Industry-standard authentication with Better-Auth
- 📦 **Type-safe**: Full TypeScript with Drizzle ORM
- 🐳 **Containerized**: Docker ready for easy deployment
- ⚡ **Lightweight**: Minimal dependencies, maximum efficiency

## Quick Start

### Prerequisites

- Bun 1.0+ or Docker
- PostgreSQL 14+ (or use Docker Compose)

### Local Development
1. Clone the repository:
```bash
git clone <repository-url>
cd auth-server
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


## Tech Stack

Runtime: Bun

Language: TypeScript

Web Framework: Hono

Auth: Better-Auth

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

✅ Input validation & sanitization

✅ CORS support


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


