import type { DataSource } from 'typeorm';
import { Task } from '../../domain/entities/Task';
import type { TaskRepository } from '../../domain/repositories/TaskRepository';

export class TypeOrmTaskRepository implements TaskRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(task: Task): Promise<Task> {
    return this.dataSource.manager.save(Task, task);
  }

  async findAll(): Promise<Task[]> {
    return this.dataSource.manager.find(Task);
  }
}
