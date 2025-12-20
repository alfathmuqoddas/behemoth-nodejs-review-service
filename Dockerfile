# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy source code and config
COPY . .

# Build the application
RUN npm run build

# Prune devDependencies to keep the image small
RUN npm prune --production

# Stage 2: Production
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production

# Copy built artifacts and production dependencies from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
# Copy config folder if used by the app or sequelize
COPY --from=builder /usr/src/app/config ./config
# Copy .sequelizerc if needed for CLI (though CLI is not in prod deps)
COPY --from=builder /usr/src/app/.sequelizerc ./.sequelizerc

# Create keys directory for volume mounting
RUN mkdir keys && chown node:node keys

# Use non-root user for security
USER node

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
