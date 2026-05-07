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
| **CI**           | GitHub Actions (lint, typecheck, test, e2e)                               |
| **Despliegue**   | Render Blueprint (`render.yaml`)                                          |

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

### Despliegue en Render

El despliegue productivo está definido en `render.yaml`. Render crea tres recursos desde el blueprint:

| Servicio | Runtime | Rol |
| :------- | :------ | :-- |
| `task-manager-frontend` | Docker | Sirve el build de Vite y proxya `/tasks` y `/health` hacia la API |
| `task-manager-api` | Docker | API Fastify + TypeORM |
| `task-manager-db` | PostgreSQL gestionado | Base de datos relacional |

Flujo operativo:

1. Conectar el repositorio en Render Dashboard.
2. Render detecta `render.yaml` y crea los servicios.
3. Cada push a `main` dispara el redeploy automático de Render.

#### Seguridad — 3 capas en backend

| Capa          | Mecanismo                                     |
| :------------ | :-------------------------------------------- |
| **CORS**      | `@fastify/cors` — origen configurable por entorno |
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

## 🚀 CI (GitHub Actions)

El pipeline se ejecuta en `push` y `pull_request` a `main`. GitHub Actions mantiene solo quality gates; el despliegue lo gestiona Render.

```
push/PR ──► lint ──────┐
                       ├──► test
        ──► typecheck ─┤
                       └──► test-e2e
```

| Job        | Comando                                | ¿Cuándo?                          |
| :--------- | :------------------------------------- | :-------------------------------- |
| **lint**       | `pnpm -r lint`                     | push y PR                         |
| **typecheck**  | `pnpm -r typecheck`                | push y PR                         |
| **test**       | `pnpm -r test`                     | push y PR (needs lint + typecheck)|
| **test-e2e**   | `pnpm test:e2e`                    | push y PR (needs lint + typecheck)|

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
| **Render Blueprint**            | Infraestructura productiva declarativa y versionada en `render.yaml`     |
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
├── render.yaml
├── .github/workflows/ci.yml
└── BLUEPRINT.md
```
