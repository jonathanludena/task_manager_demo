import { Task } from '../../domain/entities/Task';
import type { TaskRepository } from '../../domain/repositories/TaskRepository';

export class MarkTaskCompleteUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(id: string): Promise<Task | null> {
    const task = await this.repository.findById(id);

    if (!task) {
      return null;
    }

    const updatedTask = new Task(
      task.id,
      task.title,
      task.description,
      true,
      task.createdAt,
    );

    return this.repository.save(updatedTask);
  }
}
