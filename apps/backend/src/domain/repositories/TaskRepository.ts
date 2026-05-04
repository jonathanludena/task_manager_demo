import type { Task } from '../entities/Task';
import type { TaskFilters } from '@task-manager/shared';

// Re-export para compatibilidad
export type { TaskFilters };

export interface TaskRepository {
  save(task: Task): Promise<Task>;
  findAll(filters?: TaskFilters): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}
