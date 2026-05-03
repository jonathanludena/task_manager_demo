FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile
COPY apps/backend/ ./apps/backend/
COPY packages/shared/ ./packages/shared/
RUN pnpm --filter @task-manager/backend build

FROM node:20-alpine AS runner
WORKDIR /app
# Copy node_modules with pnpm symlinks from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
# Flatten pnpm symlinks into real files (Docker COPY doesn't resolve them)
RUN cp -rL node_modules /tmp/node_modules && rm -rf node_modules && mv /tmp/node_modules node_modules && \
    ls node_modules/reflect-metadata/Reflect.js >/dev/null 2>&1 && echo "✅ reflect-metadata OK" || echo "❌ reflect-metadata MISSING"
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
EXPOSE 3000
CMD ["node", "dist/main.js"]
