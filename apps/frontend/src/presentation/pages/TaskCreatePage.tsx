import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskForm } from '@/presentation/components/organisms/TaskForm';
import { taskApi } from '@/core/api/taskApi';
import { notifyTasksUpdated } from '@/lib/taskEvents';

export function TaskCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { title: string; description: string }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await taskApi.createTask(data);
      notifyTasksUpdated();
      navigate('/');
    } catch {
      setError('Error al crear la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Nueva Tarea</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <TaskForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
