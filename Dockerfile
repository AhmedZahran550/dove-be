FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN yarn build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment
ENV NODE_ENV=production

# Railway injects PORT dynamically, default to 4000 for local Docker
ENV PORT=4000

# Expose port (Railway ignores this, but useful for local Docker)
EXPOSE ${PORT}

# Install curl for health checks
RUN apk add --no-cache curl

# Health check - uses PORT env variable
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/v1 || exit 1

# Start application - use shell form to allow PORT env variable expansion
CMD yarn start:prod

