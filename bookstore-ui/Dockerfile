# Stage 1: Install dependencies based on package-lock.json
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package management definitions
COPY package.json package-lock.json ./

# Enforce clean installation strict to package-lock.json
RUN npm ci

# Stage 2: Rebuild the source code only when needed
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects anonymous telemetry data. Disable it if preferred:
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Production image, copy only standalone build chunks
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user for security isolation
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permissions for Next.js prerendering cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy public static files and standalone build files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4000

# Execute server bundle provided by the standalone output
CMD ["node", "server.js"]
