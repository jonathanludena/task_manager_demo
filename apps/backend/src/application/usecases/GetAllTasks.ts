import type { Task } from '../../domain/entities/Task';
import type { TaskRepository } from '../../domain/repositories/TaskRepository';

export class GetAllTasksUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    return this.repository.findAll();
  }
}
