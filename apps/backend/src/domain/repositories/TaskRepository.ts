import type { Task } from '../entities/Task';

export interface TaskRepository {
  save(task: Task): Promise<Task>;
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
}
