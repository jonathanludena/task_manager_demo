import { describe, it, expect, vi } from 'vitest';
import { Task } from '../../../domain/entities/Task';
import type { TaskRepository } from '../../../domain/repositories/TaskRepository';
import { GetAllTasksUseCase } from '../GetAllTasks';

describe('GetAllTasksUseCase', () => {
  it('should return an empty array when no tasks exist', async () => {
    const mockRepository: TaskRepository = {
      save: vi.fn(),
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetAllTasksUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(mockRepository.findAll).toHaveBeenCalledOnce();
  });

  it('should return all tasks from the repository', async () => {
    const tasks = [
      new Task('1', 'Task 1', 'Desc 1', false, new Date('2026-01-01')),
      new Task('2', 'Task 2', 'Desc 2', true, new Date('2026-01-02')),
    ];

    const mockRepository: TaskRepository = {
      save: vi.fn(),
      findAll: vi.fn().mockResolvedValue(tasks),
      findById: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetAllTasksUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]!.title).toBe('Task 1');
    expect(result[1]!.title).toBe('Task 2');
    expect(mockRepository.findAll).toHaveBeenCalledOnce();
  });
});
