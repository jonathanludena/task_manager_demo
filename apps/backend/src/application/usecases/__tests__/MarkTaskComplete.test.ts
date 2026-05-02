import { describe, it, expect, vi } from 'vitest';
import { Task } from '../../../domain/entities/Task';
import type { TaskRepository } from '../../../domain/repositories/TaskRepository';
import { MarkTaskCompleteUseCase } from '../MarkTaskComplete';

describe('MarkTaskCompleteUseCase', () => {
  it('should mark an existing task as complete', async () => {
    const existingTask = new Task('abc-123', 'My task', 'Desc', false, new Date('2026-01-01'));

    const mockRepository: TaskRepository = {
      save: vi.fn().mockImplementation(async (task: Task) => task),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingTask),
    };

    const useCase = new MarkTaskCompleteUseCase(mockRepository);

    const result = await useCase.execute('abc-123');

    expect(result).not.toBeNull();
    expect(result!.completed).toBe(true);
    expect(result!.id).toBe('abc-123');
    // Verify it called findById first, then save with updated task
    expect(mockRepository.findById).toHaveBeenCalledWith('abc-123');
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'abc-123',
        completed: true,
      }),
    );
  });

  it('should return null when task does not exist', async () => {
    const mockRepository: TaskRepository = {
      save: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };

    const useCase = new MarkTaskCompleteUseCase(mockRepository);

    const result = await useCase.execute('nonexistent-id');

    expect(result).toBeNull();
    expect(mockRepository.findById).toHaveBeenCalledWith('nonexistent-id');
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should be idempotent when task is already complete', async () => {
    const completedTask = new Task('abc-123', 'Done', 'Desc', true, new Date('2026-01-01'));

    const mockRepository: TaskRepository = {
      save: vi.fn().mockImplementation(async (task: Task) => task),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(completedTask),
    };

    const useCase = new MarkTaskCompleteUseCase(mockRepository);

    const result = await useCase.execute('abc-123');

    expect(result).not.toBeNull();
    expect(result!.completed).toBe(true);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true }),
    );
  });

  it('should mark a task as incomplete when completed=false', async () => {
    const completedTask = new Task('abc-123', 'My task', 'Desc', true, new Date('2026-01-01'));

    const mockRepository: TaskRepository = {
      save: vi.fn().mockImplementation(async (task: Task) => task),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(completedTask),
    };

    const useCase = new MarkTaskCompleteUseCase(mockRepository);

    const result = await useCase.execute('abc-123', false);

    expect(result).not.toBeNull();
    expect(result!.completed).toBe(false);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ completed: false }),
    );
  });
});
