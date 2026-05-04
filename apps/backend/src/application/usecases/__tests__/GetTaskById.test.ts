import { describe, it, expect, vi } from 'vitest';
import { Task } from '../../../domain/entities/Task';
import type { TaskRepository } from '../../../domain/repositories/TaskRepository';
import { GetTaskByIdUseCase } from '../GetTaskById';

describe('GetTaskByIdUseCase', () => {
  it('should return a task when it exists', async () => {
    const existingTask = new Task('abc-123', 'Existing', 'Desc', false, new Date());

    const mockRepository: TaskRepository = {
      save: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingTask),
      delete: vi.fn(),
    };

    const useCase = new GetTaskByIdUseCase(mockRepository);

    const result = await useCase.execute('abc-123');

    expect(result).toBe(existingTask);
    expect(result!.title).toBe('Existing');
    expect(mockRepository.findById).toHaveBeenCalledWith('abc-123');
  });

  it('should return null when task does not exist', async () => {
    const mockRepository: TaskRepository = {
      save: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
    };

    const useCase = new GetTaskByIdUseCase(mockRepository);

    const result = await useCase.execute('nonexistent-id');

    expect(result).toBeNull();
    expect(mockRepository.findById).toHaveBeenCalledWith('nonexistent-id');
  });
});
