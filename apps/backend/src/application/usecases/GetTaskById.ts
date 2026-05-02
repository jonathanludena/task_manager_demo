import type { Task } from '../../domain/entities/Task';
import type { TaskRepository } from '../../domain/repositories/TaskRepository';

export class GetTaskByIdUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(id: string): Promise<Task | null> {
    return this.repository.findById(id);
  }
}
