import { type DataSource, ILike } from 'typeorm';
import { Task } from '../../domain/entities/Task';
import type { TaskRepository, TaskFilters } from '../../domain/repositories/TaskRepository';

export class TypeOrmTaskRepository implements TaskRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(task: Task): Promise<Task> {
    return this.dataSource.manager.save(Task, task);
  }

  async findAll(filters?: TaskFilters): Promise<Task[]> {
    const where: Record<string, unknown> = {};

    if (filters?.status === 'completed') {
      where.completed = true;
    } else if (filters?.status === 'pending') {
      where.completed = false;
    }

    if (filters?.search) {
      where.title = ILike(`%${filters.search}%`);
    }

    return this.dataSource.manager.find(Task, { where });
  }

  async findById(id: string): Promise<Task | null> {
    return this.dataSource.manager.findOneBy(Task, { id });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dataSource.manager.delete(Task, id);
    return (result.affected ?? 0) > 0;
  }
}
