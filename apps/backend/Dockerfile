FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile
COPY apps/backend/ ./apps/backend/
RUN pnpm --filter @task-manager/backend build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
