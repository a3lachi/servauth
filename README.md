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

### Users Table
Stores user account information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | `text` | Unique user identifier | Primary Key |
| `email` | `text` | User's email address | Not Null, Unique |
| `emailVerified` | `boolean` | Email verification status | Default: false |
| `name` | `text` | User's display name | Nullable |
| `image` | `text` | Profile image URL | Nullable |
| `createdAt` | `timestamp` | Account creation time | Not Null, Default: now() |
| `updatedAt` | `timestamp` | Last update time | Not Null, Default: now() |

### Accounts Table  
Manages authentication providers and account linking.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | `text` | Unique account identifier | Primary Key |
| `userId` | `text` | Reference to users table | Foreign Key, Not Null |
| `accountId` | `text` | Provider-specific account ID | Not Null |
| `providerId` | `text` | Authentication provider identifier | Not Null |
| `accessToken` | `text` | OAuth access token | Nullable |
| `refreshToken` | `text` | OAuth refresh token | Nullable |
| `accessTokenExpiresAt` | `timestamp` | Access token expiration | Nullable |
| `refreshTokenExpiresAt` | `timestamp` | Refresh token expiration | Nullable |
| `scope` | `text` | OAuth scope permissions | Nullable |
| `password` | `text` | Hashed password (for email provider) | Nullable |
| `createdAt` | `timestamp` | Account creation time | Not Null, Default: now() |
| `updatedAt` | `timestamp` | Last update time | Not Null, Default: now() |

### Sessions Table
Tracks active user sessions for authentication.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | `text` | Unique session identifier | Primary Key |
| `token` | `text` | Session token | Unique, Nullable |
| `expiresAt` | `timestamp` | Session expiration time | Not Null |
| `ipAddress` | `text` | Client IP address | Nullable |
| `userAgent` | `text` | Client user agent | Nullable |
| `userId` | `text` | Reference to users table | Foreign Key, Not Null |
| `createdAt` | `timestamp` | Session creation time | Not Null, Default: now() |
| `updatedAt` | `timestamp` | Last session update | Not Null, Default: now() |

### Verifications Table
Handles email verification and password reset tokens.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | `text` | Unique verification identifier | Primary Key |
| `identifier` | `text` | Email or user identifier | Not Null |
| `value` | `text` | Verification token/code | Not Null |
| `expiresAt` | `timestamp` | Token expiration time | Not Null |
| `createdAt` | `timestamp` | Token creation time | Nullable, Default: now() |
| `updatedAt` | `timestamp` | Last update time | Nullable, Default: now() |

### Relationships

- **Users** → **Accounts**: One-to-many (one user can have multiple auth providers)
- **Users** → **Sessions**: One-to-many (one user can have multiple active sessions)  
- **Foreign Key Constraints**:
  - `accounts.userId` → `users.id` (CASCADE DELETE)
  - `sessions.userId` → `users.id` (CASCADE DELETE)


## 8. Architecture

API Layer: Hono routes

Auth Layer: Better-Auth middleware

Database Layer: Drizzle ORM for migrations & queries

Deployment: Docker (Bun app + PostgreSQL container)

## 9. Deployment

### Docker Deployment (Recommended)

The application is designed to be deployed using Docker containers for maximum portability and ease of deployment.

#### Prerequisites

- Docker 20.0+
- Docker Compose 2.0+
- Git (for cloning the repository)

#### Quick Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/a3lachi/servauth.git
   cd servauth
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your production settings
   ```

3. **Deploy with Docker Compose**:
   ```bash
   docker-compose up --build -d
   ```

4. **Verify deployment**:
   ```bash
   # Check container status
   docker-compose ps
   
   # Test health endpoint
   curl http://localhost:3000/
   ```

#### Environment Configuration

The application uses environment variables for configuration. Update your `.env` file with production values:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (automatically handled by Docker Compose)
POSTGRES_HOST=postgres
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=servauth_prod
POSTGRES_PORT=5432
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# Authentication
BETTER_AUTH_SECRET=your-super-secure-secret-key-minimum-32-characters
BETTER_AUTH_URL=https://your-domain.com
CORS_ORIGIN=https://your-frontend.com,https://your-admin.com
```

#### Docker Services

The `docker-compose.yml` configures two main services:

##### PostgreSQL Database
```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  
    POSTGRES_DB: ${POSTGRES_DB}
  ports:
    - "${POSTGRES_PORT}:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
```

##### Auth Server Application
```yaml
auth-server:
  build:
    context: .
    dockerfile: docker/Dockerfile
  environment:
    PORT: ${PORT}
    DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}
    BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
  ports:
    - "${PORT}:${PORT}"
  depends_on:
    postgres:
      condition: service_healthy
```

#### Production Deployment Commands

```bash
# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f auth-server

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: This deletes data)
docker-compose down -v

# Rebuild and restart
docker-compose up --build -d

# Scale the application (if using load balancer)
docker-compose up --scale auth-server=3 -d
```

#### Health Checks & Monitoring

The application includes built-in health checks:

```bash
# Application health check
curl http://localhost:3000/

# Expected response:
{
  "status": "healthy",
  "service": "auth-server", 
  "timestamp": "2024-01-01T00:00:00.000Z"
}

# Database connection check
docker-compose exec postgres pg_isready -U your_db_user -d servauth_prod

# Container status
docker-compose ps
```

#### Security Considerations for Production

1. **Environment Variables**:
   - Use strong, unique passwords
   - Generate secure JWT secrets (minimum 32 characters)
   - Set appropriate CORS origins

2. **Network Security**:
   - Use HTTPS in production
   - Configure firewall rules
   - Consider using Docker networks for isolation

3. **Database Security**:
   - Regular backups
   - Monitor connection limits
   - Use read replicas for scaling

4. **Container Security**:
   - Keep base images updated
   - Run containers as non-root users
   - Scan images for vulnerabilities

#### Backup & Recovery

```bash
# Database backup
docker-compose exec postgres pg_dump -U your_db_user servauth_prod > backup.sql

# Database restore
docker-compose exec -T postgres psql -U your_db_user servauth_prod < backup.sql

# Volume backup
docker run --rm -v servauth_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

#### Troubleshooting

Common deployment issues and solutions:

1. **Container won't start**:
   ```bash
   # Check logs
   docker-compose logs auth-server
   
   # Verify environment variables
   docker-compose config
   ```

2. **Database connection issues**:
   ```bash
   # Check postgres container
   docker-compose logs postgres
   
   # Test database connectivity
   docker-compose exec auth-server pg_isready -h postgres -p 5432
   ```

3. **Port conflicts**:
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Or change PORT in .env file
   PORT=8080
   ```

#### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Check deployment
docker-compose ps
curl http://localhost:3000/
```

## 10. Success Metrics

✅ API responds within <200ms for 95% of requests

✅ Authentication is secure against OWASP Top 10 vulnerabilities

✅ Server scales to 10k concurrent connections with Bun’s event loop

✅ Developer onboarding takes <10 minutes with docker-compose up


