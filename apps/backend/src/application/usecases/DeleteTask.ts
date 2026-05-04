import type { TaskRepository } from '../../domain/repositories/TaskRepository';

export class DeleteTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(id: string): Promise<boolean> {
    const task = await this.repository.findById(id);
    if (!task) return false;
    return this.repository.delete(id);
  }
}
