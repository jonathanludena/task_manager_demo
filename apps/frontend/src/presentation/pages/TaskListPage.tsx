import { useState, useEffect, useCallback } from 'react';
import { TaskList } from '@/presentation/components/organisms/TaskList';
import { TaskFilters } from '@/presentation/components/molecules/TaskFilters';
import { taskApi } from '@/core/api/taskApi';
import { notifyTasksUpdated } from '@/lib/taskEvents';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import type { TaskDTO } from '@/core/api/taskApi';
import type { TaskFilters as TaskFiltersParams } from '@task-manager/shared';

export function TaskListPage() {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchTasks = useCallback(async (searchTerm: string, statusFilter: string) => {
    setLoading(true);
    setError(null);

    try {
      const params: TaskFiltersParams = {};
      if (statusFilter) params.status = statusFilter as 'completed' | 'pending';
      if (searchTerm) params.search = searchTerm;

      const data = await taskApi.fetchTasks(
        Object.keys(params).length > 0 ? params : undefined,
      );
      setTasks(data);
    } catch {
      setError('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect --
   * La carga inicial requiere fetch dentro de useEffect. El async handler
   * settea estado (loading/tasks/error) pero no hay cascada porque solo
   * se ejecuta UNA vez al montar. Los cambios de filtro gatillan fetch
   * desde los handlers onChange, no desde efectos. */
  useEffect(() => {
    fetchTasks('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Los filtros gatillan fetch directamente desde los handlers
  // para evitar setState sincrónico dentro de efectos (React 19)
  const handleSearchChange = (value: string) => {
    setSearch(value);
    fetchTasks(value, status);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    fetchTasks(search, value);
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const updated = await taskApi.completeTask(id, completed);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      notifyTasksUpdated();
    } catch {
      setError('Error al actualizar la tarea');
    }
  };

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleDeleteCancel = () => {
    setPendingDeleteId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;

    const idToDelete = pendingDeleteId;
    const previousTasks = tasks;
    setPendingDeleteId(null);
    setError(null);

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== idToDelete));

    try {
      await taskApi.deleteTask(idToDelete);
      notifyTasksUpdated();
    } catch {
      setError('Error al eliminar la tarea');
      // Restore the task that was optimistically removed
      setTasks(previousTasks);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4">
      {/* Heading: se pierde al scrollear (normal flow) */}
      <h1 className="py-8 pb-4 text-2xl font-bold text-gray-900 dark:text-white">
        Mis Tareas
      </h1>

      {/* Filtros: siempre visibles al scrollear */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-4 pt-0 dark:bg-gray-950">
        <TaskFilters
          search={search}
          status={status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Cards: scrollean normalmente */}
      <div className="pb-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            Cargando...
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onComplete={handleToggle}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* AlertDialog for delete confirmation */}
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteConfirm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
