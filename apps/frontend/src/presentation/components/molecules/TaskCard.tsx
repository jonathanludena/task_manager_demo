import { TaskCardToggle } from '@/presentation/components/atoms/TaskCardToggle';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { TaskDTO } from '@/core/api/taskApi';

interface TaskCardProps {
  task: TaskDTO;
  onToggle: (id: string, completed: boolean) => void;
}

export function TaskCard({ task, onToggle }: TaskCardProps) {
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
      </div>
    </div>
  );
}
