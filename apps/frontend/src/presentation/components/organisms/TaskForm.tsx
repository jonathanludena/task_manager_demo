import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';

const TITLE_MAX = 100;
const DESC_MAX = 500;

const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(TITLE_MAX, `El título no puede superar ${TITLE_MAX} caracteres`),
  description: z
    .string()
    .max(DESC_MAX, `La descripción no puede superar ${DESC_MAX} caracteres`)
    .optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: { title: string; description: string }) => void;
  isSubmitting: boolean;
}

/**
 * Filtra caracteres que podrían usarse para SQL injection.
 * Permite: cualquier letra Unicode (incluye acentos, ñ, ü, etc.),
 * números, espacios, punto y coma.
 * Bloquea: ', ", ;, -, /, *, (, ), \, `, %, etc.
 */
function sanitize(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s.,]/gu, '');
}

export function TaskForm({ onSubmit, isSubmitting }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '' },
  });

  const descriptionValue = useWatch({ control, name: 'description' }) ?? '';

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({
      title: data.title,
      description: data.description ?? '',
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitize(e.target.value);
    setValue('title', sanitized, { shouldValidate: true });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitized = sanitize(e.target.value);
    setValue('description', sanitized, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          autoFocus
          {...register('title')}
          onChange={handleTitleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Ingresa el título de la tarea"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descripción
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          onChange={handleDescriptionChange}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Descripción opcional"
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.description ? (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {descriptionValue.length}/{DESC_MAX}
          </span>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear Tarea'}
      </Button>
    </form>
  );
}

export type { TaskFormData };
