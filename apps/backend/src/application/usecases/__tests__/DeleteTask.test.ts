import { describe, it, expect, vi } from 'vitest';
import type { TaskRepository } from '../../../domain/repositories/TaskRepository';
import { DeleteTaskUseCase } from '../DeleteTask';

describe('DeleteTaskUseCase', () => {
  it('should return true when task exists and is deleted', async () => {
    const mockRepo: TaskRepository = {
      findById: vi.fn().mockResolvedValue({ id: '1' }),
      delete: vi.fn().mockResolvedValue(true),
      save: vi.fn(),
      findAll: vi.fn(),
    };

    const usecase = new DeleteTaskUseCase(mockRepo);
    const result = await usecase.execute('1');

    expect(result).toBe(true);
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
  });

  it('should return false when task does not exist', async () => {
    const mockRepo: TaskRepository = {
      findById: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
    };

    const usecase = new DeleteTaskUseCase(mockRepo);
    const result = await usecase.execute('nonexistent');

    expect(result).toBe(false);
    expect(mockRepo.findById).toHaveBeenCalledWith('nonexistent');
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
