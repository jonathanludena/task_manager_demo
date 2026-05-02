import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';

const taskSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: { title: string; description: string }) => void;
  isSubmitting: boolean;
}

export function TaskForm({ onSubmit, isSubmitting }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '' },
  });

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({
      title: data.title,
      description: data.description ?? '',
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ingresa el título de la tarea"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descripción opcional"
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear Tarea'}
      </Button>
    </form>
  );
}

export type { TaskFormData };
