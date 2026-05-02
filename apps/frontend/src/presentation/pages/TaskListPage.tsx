import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TaskList } from '@/presentation/components/organisms/TaskList';
import { taskApi } from '@/core/api/taskApi';
import type { TaskDTO } from '@/core/api/taskApi';

export function TaskListPage() {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    taskApi
      .fetchTasks()
      .then(setTasks)
      .catch(() => setError('Error al cargar las tareas'))
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id: string) => {
    try {
      const updated = await taskApi.completeTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError('Error al completar la tarea');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Cargando...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Tareas</h1>
        <Link to="/create">
          <Button>Nueva Tarea</Button>
        </Link>
      </div>
      <TaskList tasks={tasks} onComplete={handleComplete} />
    </div>
  );
}
