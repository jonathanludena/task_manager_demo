import { Button } from '@/components/ui/button';
import type { TaskDTO } from '@/core/api/taskApi';

interface TaskCardProps {
  task: TaskDTO;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const createdDate = new Date(task.createdAt).toLocaleDateString();

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">Creado: {createdDate}</p>
        </div>
        <div className="ml-4">
          {task.completed ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Completada
            </span>
          ) : (
            <Button onClick={() => onComplete(task.id)}>
              Completar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
