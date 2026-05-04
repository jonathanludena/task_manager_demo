import { TaskCard } from '../molecules/TaskCard';
import type { TaskDTO } from '@/core/api/taskApi';

interface TaskListProps {
  tasks: TaskDTO[];
  onComplete: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
}

export function TaskList({ tasks, onComplete, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        <p>No hay tareas todavía.</p>
        <p className="mt-1 text-sm">Crea una nueva tarea para empezar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
