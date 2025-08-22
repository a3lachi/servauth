# Servauth

## 1. Overview

We aim to build a lightweight, high-performance authentication server that provides secure user management and session handling. The server will be powered by Bun for speed, use Hono as the HTTP framework, and integrate Better-Auth for authentication. Drizzle ORM will be used for database access, ensuring type-safe queries. The application will be containerized with Docker for easy deployment.

## 2. Goals

Provide a scalable authentication system for modern applications (web, mobile, APIs).

Ensure developer-friendly setup with TypeScript and Bun.

Guarantee security best practices (hashed passwords, secure cookies, CSRF protection, JWT or session tokens).

Enable flexibility for integration with external apps via REST/GraphQL.

Ensure deployment portability using Docker.

## 3. Non-Goals

This project will not implement a full frontend UI (only API endpoints).

OAuth2/Social logins (Google, GitHub, etc.) are not included in the MVP.

Rate-limiting, advanced analytics, or multi-tenant support are outside MVP scope.

## 4. Tech Stack

Runtime: Bun

Language: TypeScript

Web Framework: Hono

Auth: Better-Auth

ORM: Drizzle ORM

Database: PostgreSQL (default)

Containerization: Docker & Docker Compose

Testing: Vitest (preferred for Bun)

## 5. Functional Requirements

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

## 6. API Endpoints (MVP)
Method	Endpoint	Description	Auth Required

POST	/auth/register	Register a new user	❌

POST	/auth/login	Login user, returns token/session	❌

POST	/auth/logout	Logout user	✅

POST	/auth/refresh	Refresh session/token	✅

GET	/auth/me	Get logged-in user info	✅

PUT	/auth/me	Update user info	✅

DELETE	/auth/me	Delete user account	✅


## 7. Database Schema (Drizzle ORM)

### Users table

Column	Type	Constraints

id	UUID (PK)	Primary key

email	VARCHAR(255)	Unique, not null

password	VARCHAR(255)	Hashed

username	VARCHAR(100)	Optional

created_at	TIMESTAMP	Default now()

updated_at	TIMESTAMP	Auto-update

sessions table (if session-based)

Column	Type	Constraints

id	UUID (PK)	Primary key

user_id	UUID (FK)	References users.id

token	VARCHAR(255)	Unique

expires_at	TIMESTAMP	Expiration date

created_at	TIMESTAMP	Default now()

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