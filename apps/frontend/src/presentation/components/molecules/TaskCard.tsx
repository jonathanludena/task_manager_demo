import { Trash2 } from 'lucide-react';
import { TaskCardToggle } from '@/presentation/components/atoms/TaskCardToggle';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { TaskDTO } from '@/core/api/taskApi';

interface TaskCardProps {
  task: TaskDTO;
  onToggle: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <TaskCardToggle
            checked={task.completed}
            onChange={(checked) => onToggle(task.id, checked)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-sm font-medium ${
              task.completed
                ? 'text-gray-400 line-through dark:text-gray-500'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              {task.description}
            </p>
          )}

          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {formatRelativeTime(task.createdAt)}
          </p>
        </div>

        {/* Status badge */}
        <div className="shrink-0 pt-0.5">
          {task.completed ? (
            <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Completada
            </span>
          ) : (
            <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Pendiente
            </span>
          )}
        </div>

        {/* Delete button */}
        {onDelete && (
          <div className="shrink-0 pt-0.5">
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              aria-label={`Eliminar ${task.title}`}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
