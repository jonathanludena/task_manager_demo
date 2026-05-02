import { TaskCard } from '../molecules/TaskCard';
import type { TaskDTO } from '@/core/api/taskApi';

interface TaskListProps {
  tasks: TaskDTO[];
  onComplete: (id: string) => void;
}

export function TaskList({ tasks, onComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No hay tareas todavía.</p>
        <p className="mt-1 text-sm">Crea una nueva tarea para empezar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onComplete={onComplete} />
      ))}
    </div>
  );
}
