# 📋 Task Manager — Challenge App

> **Aplicación administradora de tareas (full-stack) con Clean Architecture, Atomic Design, TDD y despliegue contenerizado.**

Este proyecto es un **challenge técnico** que implementa un sistema de gestión de tareas con operaciones CRUD básicas. Está construido con un stack moderno, arquitecturas bien definidas y una cobertura de tests del 80%+.

---

## 🧱 Stack Tecnológico

| Capa             | Tecnología                                                                 |
| :--------------- | :------------------------------------------------------------------------- |
| **Monorepo**     | pnpm workspace                                                            |
| **Frontend**     | React 19 + Vite 8 + TypeScript (strict)                                   |
| **UI / Estilos** | shadcn/ui + Tailwind CSS 4 + @base-ui/react + Geist Variable              |
| **Formularios**  | react-hook-form + Zod                                                      |
| **Backend**      | Node.js + Fastify 5 + TypeScript (strict)                                  |
| **ORM / DB**     | TypeORM + PostgreSQL 16                                                     |
| **Tests unitarios e integración** | Vitest + React Testing Library + MSW (Mock Service Worker)    |
| **E2E**          | Playwright                                                                 |
| **Contenedores** | Docker & Docker Compose (multi-stage builds)                               |
| **CI/CD**        | GitHub Actions (lint → typecheck → build → test → e2e → deploy)           |
| **Proxy / SSL**  | nginx (edge reverse proxy) + Let's Encrypt (certbot webroot)               |
| **Despliegue**   | VPS Hostinger — SSH + GHCR (GitHub Container Registry)                    |

---

## 🏗️ Arquitectura del Proyecto

```
challenge_smartjob_may2026/
├── apps/
│   ├── backend/          # API REST — Clean Architecture
│   ├── frontend/         # SPA React — Clean-ish + Atomic Design
├── packages/             # (futuro) Código compartido, schemas, tipos
├── docker-compose.yml    # Producción: frontend + backend + postgres
├── docker-compose.local.yml  # Local: solo PostgreSQL
├── .github/workflows/    # CI — lint, typecheck, test, e2e
└── tsconfig.base.json    # Config base compartida de TypeScript
```

---

## 🔧 Backend — Clean Architecture en 3 Capas

El backend sigue **Clean Architecture** con inyección de dependencias manual. Las capas se comunican hacia adentro: Infrastructure depende de Application, Application depende de Domain. Nunca al revés.

```
apps/backend/src/
├── domain/               # 🎯 Capa más interna — reglas de negocio
│   ├── entities/
│   │   └── Task.ts       # Entidad (con decoradores TypeORM)
│   └── repositories/
│       └── TaskRepository.ts  # Interfaz — puerto de salida
│
├── application/          # ⚙️ Casos de uso — orquestan la lógica
│   ├── dtos/
│   │   └── CreateTaskDTO.ts
│   └── usecases/
│       ├── CreateTask.ts
│       ├── GetAllTasks.ts
│       ├── GetTaskById.ts
│       └── MarkTaskComplete.ts
│
├── infrastructure/       # 🔌 Frameworks, DB, HTTP — adaptadores
│   ├── config/env.ts
│   ├── database/dataSource.ts
│   ├── repositories/
│   │   └── TypeOrmTaskRepository.ts  # Implementación del puerto
│   ├── routes/
│   │   ├── health.ts
│   │   └── tasks.ts
│   └── server.ts
│
└── main.ts               # Entry point
```

**Principio aplicado: Dependency Inversion** — los casos de uso no conocen TypeORM ni Fastify. Dependen de la interfaz `TaskRepository`, y la implementación concreta (`TypeOrmTaskRepository`) se inyecta desde Infrastructure.

**API Endpoints:**

| Método | Ruta                   | Acción                   |
| :----- | :--------------------- | :----------------------- |
| `GET`  | `/health`              | Health check             |
| `POST` | `/tasks`               | Crear tarea              |
| `GET`  | `/tasks`               | Listar todas las tareas  |
| `PATCH`| `/tasks/:id/complete`  | Marcar tarea completada  |

---

## 🎨 Frontend — Clean-ish Architecture + Atomic Design

El frontend adapta Clean Architecture del lado del cliente separando la lógica de negocio (`core/`) de la UI (`presentation/`), y dentro de la UI aplica **Atomic Design** (átomos → moléculas → organismos → páginas).

```
apps/frontend/src/
├── core/                        # 🧠 Lógica de negocio e infraestructura
│   ├── api/
│   │   └── taskApi.ts          # Fetch API — adaptador HTTP
│   ├── config/
│   │   └── env.ts              # Variables de entorno tipadas
│   ├── entities/                # (stubs) Entidades de dominio
│   ├── usecases/                # (stubs) Casos de uso futuros
│   └── router.tsx               # Configuración de rutas
│
├── presentation/                # 🎨 UI y estado de presentación
│   ├── components/
│   │   ├── atoms/               # Componentes base futuros
│   │   ├── molecules/
│   │   │   └── TaskCard.tsx     # Card individual de tarea
│   │   └── organisms/
│   │       ├── TaskList.tsx     # Lista de tareas
│   │       └── TaskForm.tsx     # Formulario de creación
│   ├── hooks/                   # Custom hooks
│   ├── pages/
│   │   ├── TaskListPage.tsx     # Página principal — lista
│   │   └── TaskCreatePage.tsx   # Página de creación
│   └── styles/                  # Temas y estilos globales
│
├── components/ui/               # 🧩 shadcn/ui + @base-ui
│   └── button.tsx
│
├── lib/
│   └── utils.ts                 # cn() utility (clsx + tailwind-merge)
│
├── test/                        # 🧪 Testing infrastructure
│   ├── handlers/
│   │   └── taskHandlers.ts      # MSW handlers (mock API)
│   ├── server.ts                # MSW server (tests)
│   ├── browser.ts               # MSW browser (dev)
│   ├── renderWithProviders.tsx  # Custom render con MemoryRouter
│   └── setup.ts                 # Setup global de tests
│
├── App.tsx
└── main.tsx
```

### Patrón de Páginas

Cada página sigue un patrón **Container-Presentational** liviano:
- La **page** maneja estado (loading, error, data) y orquesta llamadas al API.
- Los **organismos** reciben datos y callbacks como props — son puramente presentacionales.

---

## 🧪 Estrategia de Testing — TDD

Se aplica **Red-Green-Refactor** estrictamente. Cobertura mínima: **80%** (líneas, funciones, ramas, statements).

### Backend

| Tests                      | Qué cubren                                      |
| :------------------------- | :---------------------------------------------- |
| `domain/entities/__tests__/` | Entidad Task — creación y propiedades         |
| `application/usecases/__tests__/` | Casos de uso con repositorio mockeado |
| `infrastructure/routes/__tests__/` | Rutas HTTP con `server.inject()` (Fastify) |

### Frontend

| Tests                                      | Qué cubren                                |
| :----------------------------------------- | :---------------------------------------- |
| `components/molecules/__tests__/TaskCard`  | Render condicional, eventos              |
| `components/organisms/__tests__/TaskList`  | Listas, estados vacíos, badges           |
| `components/organisms/__tests__/TaskForm`  | Validación Zod, envío, loading           |
| `pages/__tests__/TaskListPage`             | Loading, render con MSW                  |
| `pages/__tests__/TaskCreatePage`           | Submit, navegación, error handling       |
| `core/api/__tests__/taskApi`               | Fetch mockeado — éxito y error           |

### E2E (Playwright)

| Archivo               | Flujo                                  |
| :-------------------- | :------------------------------------- |
| `e2e/app.spec.ts`     | Shell de la app, navegación            |
| `e2e/tasks.spec.ts`   | Crear, listar, completar, validaciones |

**Infraestructura de testing:**
- **MSW (Mock Service Worker):** intercepta requests HTTP tanto en tests (node) como en desarrollo (browser). Los tests nunca tocan la red real.
- **`renderWithProviders`:** custom render que envuelve componentes con `MemoryRouter` y expone `userEvent` para interacciones realistas.

---

## 🐳 Ejecución en Entornos

### Local (desarrollo)

```bash
# 1. Base de datos
docker compose -f docker-compose.local.yml up -d

# 2. Backend (HMR con tsx watch)
pnpm --filter @task-manager/backend dev

# 3. Frontend (HMR con Vite)
pnpm --filter @task-manager/frontend dev
```

El frontend en dev usa **MSW Browser** para mockear la API — no necesita el backend corriendo para desarrollo frontend.

### Tests

```bash
# Todo el monorepo
pnpm test

# Solo backend
pnpm --filter @task-manager/backend test

# Solo frontend
pnpm --filter @task-manager/frontend test

# E2E (Playwright)
pnpm test:e2e
```

### Despliegue en producción

```bash
# Primer deploy (con staging de Let's Encrypt para probar sin rate limits)
STAGING=true bash deploy.sh

# Verificar en https://app-challenge-0526.lproconsulting.com

# Certificados reales
STAGING=false bash deploy.sh
```

### Producción — VPS Hostinger

La aplicación está desplegada en un **VPS Hostinger** con Ubuntu, accesible vía:

| Servicio   | URL                                          |
| :--------- | :------------------------------------------- |
| **Frontend** | [`https://app-challenge-0526.lproconsulting.com`](https://app-challenge-0526.lproconsulting.com) |
| **Backend**  | [`https://api-challenge-0526.lproconsulting.com`](https://api-challenge-0526.lproconsulting.com) |

#### Infraestructura del deploy

```
Internet ──► VPS Hostinger (puertos 80, 443)
                 │
                 ▼
         ┌───────────────┐
         │  nginx:alpine  │ ← Edge proxy: SSL termination + subdomain routing
         │  puertos 80/443│   TLS 1.2+ | Mozilla Intermediate
         └───┬───────┬───┘
             │       │
       app-challenge  api-challenge
             │       │
         ┌───▼──┐ ┌──▼──────┐
         │front │ │ backend  │ ← Red interna Docker
         │end   │ │ :3000    │
         │:80   │ │ Fastify  │
         └──┬───┘ └──┬──────┘
            │        │
            └────┬───┘
                 │
           ┌─────▼─────┐
           │ postgres  │
           │ :5432     │
           │ volumen   │
           │ pgdata    │
           └───────────┘

certbot (on-demand via --profile certbot) → Let's Encrypt webroot → ./certbot/{conf,www}
         ↓ self-signed bootstrap → staging → production
```

#### Componentes

| Servicio    | Imagen / Build                               | Rol                              |
| :---------- | :------------------------------------------- | :------------------------------- |
| **nginx**   | `nginx:alpine`                               | Edge reverse proxy, SSL, routing |
| **frontend**| Build multi-stage (node → nginx)             | SPA React, proxy `/tasks` a API |
| **backend** | Build multi-stage (pnpm deploy)              | API Fastify + TypeORM            |
| **postgres**| `postgres:16-alpine`                         | Base de datos relacional         |
| **certbot** | `certbot/certbot` (perfil `certbot`)         | Certificados Let's Encrypt       |

#### Seguridad — 3 capas en backend

| Capa          | Mecanismo                                     |
| :------------ | :-------------------------------------------- |
| **CORS**      | `@fastify/cors` — solo `app-challenge-0526...` |
| **Rate-limit**| `@fastify/rate-limit` — 100 req/min por IP    |
| **Shared Secret** | Header `X-Internal-Secret` inyectado por frontend nginx, validado por backend con `crypto.timingSafeEqual` |

#### Migraciones

TypeORM con `migrationsRun: true` en producción — las migraciones se ejecutan automáticamente al iniciar el backend:

```bash
# Generar nueva migración tras cambiar una entidad
pnpm --filter @task-manager/backend migration:generate -- src/infrastructure/database/migrations/NombreMigration

# Ejecutar migraciones manualmente
docker compose exec backend pnpm migration:run

# Revertir última migración
docker compose exec backend pnpm migration:revert
```

---

## 🚀 CI/CD (GitHub Actions)

El pipeline se ejecuta en `push` y `pull_request` a `main`. El deploy solo ocurre en `push` a `main`.

```
push/PR ──► lint ──┐
                   ├──► test ──┐
        ──► typecheck ─┘       ├──► deploy (main push only)
                   ├──► test-e2e ─┘
        ──► build (main push only, GHCR) ─┘
```

| Job        | Comando                                | ¿Cuándo?                          |
| :--------- | :------------------------------------- | :-------------------------------- |
| **lint**       | `pnpm -r lint`                     | push y PR                         |
| **typecheck**  | `pnpm -r typecheck`                | push y PR                         |
| **test**       | `pnpm -r test`                     | push y PR (needs lint + typecheck)|
| **test-e2e**   | `pnpm test:e2e`                    | push y PR (needs lint + typecheck)|
| **build**      | Docker Buildx → push a GHCR         | push a main (needs lint + typecheck) |
| **deploy**     | SSH → `bash deploy.sh`             | push a main (needs build + test + test-e2e) |

### Deploy Script (`deploy.sh`)

El script que se ejecuta en el VPS vía SSH realiza:

```
git pull → generar cert self-signed (si no hay real) → docker compose down
→ pull imágenes de GHCR (o build local como fallback)
→ docker compose up -d → migrations (automáticas en startup)
→ esperar nginx → certbot (webroot, staging o producción)
→ copiar certs → reload nginx → docker image prune
```

### Secrets de GitHub Requeridos

| Secret          | Descripción                          |
| :-------------- | :----------------------------------- |
| `VPS_HOST`      | IP del VPS Hostinger                |
| `VPS_USER`      | Usuario SSH (`friday`)              |
| `VPS_SSH_KEY`   | Clave privada SSH                    |
| `VPS_APP_PATH`  | Ruta del repo en VPS (`/home/friday/app`) |

---

## 🧭 Decisiones Técnicas

| Decisión                        | Por qué                                                                 |
| :------------------------------ | :---------------------------------------------------------------------- |
| **Monorepo con pnpm**           | Dependencias compartidas, scripts unificados, builds paralelos          |
| **Inyección manual de deps**    | Sin framework DI pesado — explícito, testeable, sin magia               |
| **MSW en frontend**             | Mock de API sin cambiar código, funciona en dev y tests                 |
| **Atomic Design**               | Escalabilidad visual, componentes reutilizables y predecibles           |
| **Fastify inject**              | Tests de rutas sin levantar servidor real — órdenes de magnitud más rápido |
| **Zod + react-hook-form**       | Validación tipada en runtime, esquemas compartibles, rendimiento        |
| **Tailwind CSS 4 + shadcn/ui**  | Sistema de diseño consistente sin runtime CSS, componentes headless     |
| **Docker multi-stage**          | Imágenes finales mínimas (~100MB frontend, ~150MB backend)              |
| **pnpm deploy**                 | `node_modules` plano (sin symlinks) para imágenes Docker reproducibles    |
| **Dos capas de nginx**          | Edge proxy (SSL) + frontend nginx (SPA + proxy interno) sin tocar la app |
| **certbot webroot**             | Sin necesidad de detener nginx para renovar certs — HTTP-01 challenge    |
| **validate-if-present** (secret)| Ruta API externa funciona sin secret, solo CORS + rate-limit               |

---

## 📁 Estructura de Archivos Clave

```
.
├── apps/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── domain/entities/Task.ts
│   │   │   ├── domain/repositories/TaskRepository.ts
│   │   │   ├── application/usecases/*.ts
│   │   │   ├── infrastructure/server.ts
│   │   │   ├── infrastructure/routes/tasks.ts
│   │   │   └── main.ts
│   │   └── vitest.config.ts
│   └── frontend/
│       ├── Dockerfile
│       ├── nginx.conf
│       ├── playwright.config.ts
│       ├── src/
│       │   ├── core/api/taskApi.ts
│       │   ├── core/router.tsx
│       │   ├── presentation/pages/*.tsx
│       │   ├── presentation/components/organisms/*.tsx
│       │   ├── presentation/components/molecules/TaskCard.tsx
│       │   ├── components/ui/button.tsx
│       │   └── test/
│       └── vitest.config.ts
├── docker-compose.yml
├── docker-compose.local.yml
├── .github/workflows/ci.yml
└── BLUEPRINT.md
```
