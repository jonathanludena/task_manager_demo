import type { Task } from '../entities/Task';

export interface TaskFilters {
  status?: 'completed' | 'pending';
  search?: string;
}

export interface TaskRepository {
  save(task: Task): Promise<Task>;
  findAll(filters?: TaskFilters): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
}
