# Stage 1: Builder
FROM node:24-alpine AS builder

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Use npm ci instead of npm install for reproducible builds
RUN npm ci

# Copy source code and config
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Dependencies
FROM node:24-alpine AS dependencies

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

# Install only production dependencies with npm ci
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 3: Production Runtime
FROM node:24-alpine AS runner

# Install dumb-init
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production \
    PORT=3000

# Copy production dependencies from dedicated stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy built artifacts from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

# Copy config files (only if needed at runtime)
COPY --from=builder /usr/src/app/config ./config

# Copy .sequelizerc only if migrations run in production
# (Generally not recommended - run migrations separately)
COPY --from=builder /usr/src/app/.sequelizerc ./.sequelizerc

# Create non-root user (node user already exists in node:alpine)
# Create keys directory with proper permissions
RUN mkdir -p keys && \
    chown -R node:node /usr/src/app

# Security: Remove setuid/setgid permissions
RUN find / -perm /6000 -type f -exec chmod a-s {} \; 2>/dev/null || true

# Switch to non-root user
USER node

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init as entrypoint for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start with node directly instead of npm for better signal handling
CMD ["node", "dist/server.js"]