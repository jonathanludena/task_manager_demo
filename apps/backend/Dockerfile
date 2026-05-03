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
# pnpm deploy creates a flat node_modules (no symlinks) ideal for Docker
RUN pnpm deploy --filter @task-manager/backend /tmp/deploy --legacy

FROM node:20-alpine AS runner
RUN npm install -g tsx
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /tmp/deploy/node_modules ./node_modules
COPY --from=builder /tmp/deploy/package.json ./
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
EXPOSE 3000
CMD ["tsx", "dist/main.js"]
