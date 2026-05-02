import type { Task } from '../../domain/entities/Task';
import type { TaskRepository, TaskFilters } from '../../domain/repositories/TaskRepository';

export class GetAllTasksUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(filters?: TaskFilters): Promise<Task[]> {
    return this.repository.findAll(filters);
  }
}
