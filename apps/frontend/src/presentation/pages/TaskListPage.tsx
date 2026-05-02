import { useState, useEffect, useCallback } from 'react';
import { TaskList } from '@/presentation/components/organisms/TaskList';
import { TaskFilters } from '@/presentation/components/molecules/TaskFilters';
import { taskApi } from '@/core/api/taskApi';
import type { TaskDTO } from '@/core/api/taskApi';

export function TaskListPage() {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchTasks = useCallback(async (searchTerm: string, statusFilter: string) => {
    setLoading(true);
    setError(null);

    try {
      const params: { status?: 'completed' | 'pending'; search?: string } = {};
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

  useEffect(() => {
    fetchTasks(search, status);
  }, [fetchTasks, search, status]);

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const updated = await taskApi.completeTask(id, completed);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError('Error al actualizar la tarea');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Mis Tareas
      </h1>

      <TaskFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

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
        <TaskList tasks={tasks} onComplete={handleToggle} />
      )}
    </div>
  );
}
