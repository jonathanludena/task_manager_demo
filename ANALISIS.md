# Análisis de Decisiones Arquitectónicas — Task Manager

Proyecto: `challenge_smartjob_may2026`
Fecha: Mayo 2026

---

## 1. ¿Por qué se usó un monorepo?

### Evidencia en el código

- **`pnpm-workspace.yaml`** define `apps/*` y `packages/*` como workspaces.
- **Root `package.json`** tiene scripts unificados: `pnpm -r dev`, `pnpm -r test`, `pnpm -r lint`, `pnpm -r typecheck`.
- **`packages/shared/src/index.ts`** exporta `TaskDTO`, `CreateTaskPayload`, `TaskFilters` — el contrato de la API tipado.
- Ambos `apps/frontend/package.json` y `apps/backend/package.json` dependen de `"@task-manager/shared": "workspace:*"`.
- **`tsconfig.base.json`** compartido en la raíz; los Dockerfiles copian el workspace root completo + shared.
- **CI (`ci.yml`)** corre lint, typecheck, test, y e2e con `pnpm -r` en un solo pipeline.
- **`BLUEPRINT.md`** y **`README.md`** documentan la decisión explícitamente.

### Razones

| Beneficio | Cómo se materializa |
|---|---|
| **Contrato API tipado compartido** | Cambiar un DTO requiere un solo commit. Frontend y backend nunca se desincronizan en tipos. |
| **Tooling unificado** | Un solo `pnpm install`, un solo lockfile (`pnpm-lock.yaml`), un solo `tsconfig.base.json`. |
| **Commits atómicos** | Features que tocan frontend + backend + tipos compartidos van en un solo PR, revisables de una vez. |
| **Builds reproducibles** | Los Dockerfiles de frontend y backend usan el mismo `pnpm-lock.yaml` raíz para ambos servicios. |
| **Refactors seguros** | Renombrar un campo en `packages/shared` rompe la compilación en ambos lados si no se actualizan — el compilador te avisa. |

### ¿Qué pasaría con repos separados?

- **`packages/shared`** tendría que publicarse como un package npm (overhead de versionado semántico y publicación) o como git submodule (complejidad operativa).
- **Los tipos se desincronizarían** fácilmente: backend cambia un campo, frontend no se entera hasta runtime → errores sutiles.
- **CI/CD fragmentado**: coordinar deploys entre repos independientes es propenso a race conditions y fallos de integración.
- **Docker builds** tendrían que clonar múltiples repos o inyectar packages como build args — más frágil.
- **Los commits atómicos desaparecerían**: un cambio que toca ambos lados requeriría PRs en dos repos, coordinación manual, y merge sincronizado.

---

## 2. ¿Por qué no usar Next.js y qué retos habría para el despliegue actual?

### Arquitectura actual

```
                    ┌──────────────────────────────────┐
                    │        Render Blueprint           │
                    │ frontend + api + managed database │
                    └───────┬──────────────┬────────────┘
                            │              │
                    ┌───────▼──────┐ ┌─────▼──────────┐
                    │   Frontend   │ │    Backend      │
                    │ nginx:alpine │ │   Fastify 5     │
                    │ (SPA estática)│ │  TypeORM + PG   │
                    └──────────────┘ └─────┬────────────┘
                                           │
                                    ┌──────▼───────────┐
                                    │   PostgreSQL      │
                                    │   gestionado      │
                                    └──────────────────┘
```

- **Frontend**: React 19 + Vite → build estático → servido por `nginx:alpine` (~100 MB).
- **Backend**: Fastify 5 + TypeORM 0.3.28 + PostgreSQL, contenedor separado en puerto 3000.
- **Frontend web**: nginx embebido sirve la SPA y proxya `/tasks` y `/health` hacia la API.
- **Seguridad**: CORS configurado, rate-limit, header `X-Internal-Secret`.
- **Deploy**: Render usa `render.yaml`; GitHub Actions queda como pipeline de calidad.

### ¿Qué cambiaría con Next.js?

Next.js es un framework full-stack que unifica frontend y backend en una sola aplicación Node.js:

| Aspecto | Actual (Vite + Fastify) | Con Next.js |
|---|---|---|
| **Tipo de app** | CSR SPA + REST API separados | SSR/SSG + API Routes monolítico |
| **Frontend container** | `nginx:alpine` sirviendo estáticos | Node.js corriendo `next start` |
| **Backend** | Fastify con clean architecture | API Routes (archivo por ruta) |
| **Servicios** | Web y API separados | Un solo servicio con `/api/*` |
| **Rollback** | Por servicio (selectivo) | Todo-o-nada (monolítico) |

### Retos específicos para el despliegue actual

#### 1. Docker

| Aspecto | Actual | Con Next.js |
|---|---|---|
| Imagen frontend | `nginx:alpine` + estáticos (~100 MB) | Node.js + `next start` (~200-300 MB+) |
| Build | Multi-stage con pnpm en stage 1, solo copia `dist/` a stage 2 | El stage final incluye Node.js runtime completo |
| Recursos | Mínimos (nginx es livianísimo) | Más RAM y CPU (SSR renderiza en cada request) |

Una imagen de Node.js corriendo SSR consume significativamente más memoria que nginx alpine sirviendo archivos estáticos. En planes pequeños, ese costo importa y reduce margen operativo.

#### 2. Routing y certificados

Render simplifica certificados y routing por servicio. Con Next.js habría que decidir si se mantiene una API separada, se migra a rutas del framework, o se mezcla ambos modelos; esa decisión aumenta el alcance sin mejorar el challenge.

#### 3. Base de datos y TypeORM

Fastify mantiene un pool de conexiones persistente a PostgreSQL (vía TypeORM `DataSource`). En Next.js API Routes, el modelo es **stateless**: cada request es una función lambda. TypeORM no está diseñado para abrir/cerrar conexiones por request — necesitarías un singleton con manejo cuidadoso del ciclo de vida (hot reloading de Next.js en dev complica esto).

#### 4. CI y despliegue

| Actual | Con Next.js |
|---|---|
| Dos servicios Docker independientes | Una sola imagen monolítica |
| Rollback selectivo por servicio | Rollback todo-o-nada |
| Build paralelo de ambos servicios | Build secuencial (Next.js build genera frontend y API juntos) |
| Cacheo por capa independiente | Una sola capa de cache |

#### 5. Clean Architecture

El backend actual sigue principios de Clean Architecture (Domain → Application → Infrastructure con inyección manual de dependencias). Next.js API Routes están diseñadas para un modelo más simple: archivo por ruta en `app/api/`. Migrar la arquitectura actual a ese modelo sería un retroceso en diseño o requeriría adaptaciones forzadas.

### Conclusión

La arquitectura actual (Vite + Fastify separados) está **diseñada para servicios separados en Render**. Cambiar a Next.js requeriría rediseñar Dockerfiles, routing, pipeline de calidad y despliegue, además de resolver problemas que no existen hoy (consumo de memoria, conexiones a DB stateless, rollback selectivo). El beneficio percibido de "unificar" no compensa el costo de migración ni la pérdida de separación de concerns.

---

## 3. ¿Qué rol tiene MSW en este proyecto?

### Configuración

MSW (Mock Service Worker) está instalado en `apps/frontend` (`msw@^2.7.6`) y configurado en:

| Archivo | Rol |
|---|---|
| `apps/frontend/src/test/browser.ts` | `setupWorker(...handlers)` — worker para el navegador (modo dev) |
| `apps/frontend/src/test/server.ts` | `setupServer(...handlers)` — servidor para tests (Node.js / Vitest) |
| `apps/frontend/src/test/handlers/taskHandlers.ts` | Handlers concretos que mockean la API REST |
| `apps/frontend/src/test/setup.ts` | Setup global de Vitest (inicia/limpia MSW server) |
| `apps/frontend/src/main.tsx` | Inicia MSW browser worker solo en `import.meta.env.DEV` |

### Handlers mockeados

MSW intercepta 4 endpoints REST:

```
GET    */tasks          → listar tareas
POST   */tasks          → crear tarea
DELETE */tasks/:id      → eliminar tarea
PATCH  */tasks/:id/complete → marcar como completada
```

**Persistencia en desarrollo**: usa `localStorage` con clave `msw_tasks` — las tareas creadas sobreviven recargas de página. Datos iniciales: "Learn TDD" (pending) y "Setup CI" (completed).

### Integración con testing

#### Unitarios / Integración (Vitest)

```typescript
// Ejemplo: forzar error 500 en un test
server.use(
  http.get('*/tasks', () => {
    return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  })
)
```

- `server.resetHandlers()` en `afterEach` para limpiar entre tests.
- `localStorage.removeItem('msw_tasks')` en `beforeEach` para datos limpios.
- Tests de `TaskListPage` verifican estados: loading, error 500, error 404, lista vacía, lista con datos.

#### E2E (Playwright)

`playwright.config.ts` levanta `pnpm dev` (Vite + MSW worker). Los tests E2E corren contra el dev server mockeado — **no necesitan backend ni base de datos**. El CI ejecuta Playwright sin levantar Docker Compose completo.

### Valor que aporta

| Beneficio | Cómo se materializa |
|---|---|
| **Frontend sin backend** | `README.md` lo documenta: no necesitás backend corriendo para desarrollar el frontend |
| **Tests deterministas** | Sin flakiness por red, latencia, o backend caído |
| **Edge cases simulables** | Error 500, 404, timeout, lista vacía → un `server.use()` y listo |
| **No contamina código productivo** | Handlers en `src/test/`. `taskApi.ts` usa `fetch` normal sin saber que MSW existe |
| **E2E en CI sin infraestructura** | Playwright en GitHub Actions no necesita PostgreSQL ni Docker |
| **Contrato validado** | MSW handlers y backend comparten tipos de `packages/shared` |

### Riesgo

**Divergencia de handlers**: si la API real cambia y los handlers de MSW no se actualizan, los tests pasan pero la app falla en producción. Se requiere disciplina para mantener la sincronía entre handlers y la API real.

---

## Resumen

Las tres decisiones — monorepo, Vite+Fastify separados, y MSW — están **coherentemente justificadas** y se refuerzan entre sí:

- El **monorepo** permite compartir tipos que usan tanto el backend real como los handlers de MSW.
- La **separación Vite+Fastify** respeta el despliegue por servicios y permite rollback independiente.
- **MSW** permite desarrollar y testear el frontend sin depender del backend, cerrando el ciclo de desarrollo rápido que el monorepo habilita.

Cambiar cualquiera de estas decisiones requeriría reconsiderar la arquitectura completa.
