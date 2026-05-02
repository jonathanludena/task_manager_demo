const TASKS_UPDATED_EVENT = 'tasks-updated';

/**
 * Dispara un evento personalizado para notificar que las tareas cambiaron.
 * El Sidebar escucha este evento para actualizar el gráfico de progreso.
 */
export function notifyTasksUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TASKS_UPDATED_EVENT));
  }
}

/**
 * Hook para escuchar cambios en las tareas.
 * Recibe un callback que se ejecuta cada vez que se crea/togglea una tarea.
 */
export function onTasksUpdated(callback: () => void): () => void {
  if (typeof window !== 'undefined') {
    window.addEventListener(TASKS_UPDATED_EVENT, callback);
    return () => window.removeEventListener(TASKS_UPDATED_EVENT, callback);
  }
  return () => {};
}
