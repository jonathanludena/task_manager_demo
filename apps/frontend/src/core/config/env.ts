/// <reference types="vite/client" />

export const env = {
  /**
   * API base URL.
   *
   * - **Local dev (sin MSW):** `http://localhost:3000`
   * - **Local dev (MSW):** no importa, MSW intercepta todo
   * - **Docker compose (producción):** `http://localhost:3000` (ports mapeados)
   * - **Render (nginx proxy):** `''` (vacío → URLs relativas, nginx proxy)
   *
   * Cuando está vacío, `taskApi.ts` usa URLs relativas (`/tasks`, `/health`)
   * y nginx se encarga del proxy reverso hacia el backend.
   */
  API_URL: import.meta.env.VITE_API_URL ?? '',
} as const;

export type Env = typeof env;
