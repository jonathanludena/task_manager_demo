FROM node:20-alpine AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile
COPY apps/frontend/ ./apps/frontend/
RUN pnpm --filter @task-manager/frontend build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
