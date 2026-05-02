import { Task } from '../../domain/entities/Task';
import type { TaskRepository } from '../../domain/repositories/TaskRepository';
import type { CreateTaskDTO } from '../dtos/CreateTaskDTO';

export class CreateTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(dto: CreateTaskDTO): Promise<Task> {
    const task = new Task(
      crypto.randomUUID(),
      dto.title,
      dto.description ?? '',
      false,
      new Date(),
    );

    return this.repository.save(task);
  }
}
