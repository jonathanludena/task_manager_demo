/**
 * @task-manager/shared
 *
 * Tipos compartidos entre frontend y backend.
 * Definen el contrato de la API REST.
 */

// ─── Domain Types ───────────────────────────────────────────

/** Estado de filtro para listar tareas */
export type TaskStatusFilter = 'completed' | 'pending';

// ─── API DTOs ───────────────────────────────────────────────

/** Respuesta de una tarea desde la API */
export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

/** Payload para crear una tarea (POST /tasks) */
export interface CreateTaskPayload {
  title: string;
  description?: string;
}

/** Filtros para listar tareas (GET /tasks query params) */
export interface TaskFilters {
  status?: TaskStatusFilter;
  search?: string;
}
