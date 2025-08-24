FROM oven/bun:1.1.42-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (without lockfile to avoid version conflicts)
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check using health route
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Install curl for healthcheck
RUN apk add --no-cache curl

# Start the server
CMD ["bun", "run", "start"]