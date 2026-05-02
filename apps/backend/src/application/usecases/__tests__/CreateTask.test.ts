import { describe, it, expect, vi } from 'vitest';
import { Task } from '../../../domain/entities/Task';
import type { TaskRepository } from '../../../domain/repositories/TaskRepository';
import { CreateTaskUseCase } from '../CreateTask';
import type { CreateTaskDTO } from '../../dtos/CreateTaskDTO';

describe('CreateTaskUseCase', () => {
  it('should create a task and save it via repository', async () => {
    const mockTask = new Task(
      'mock-id',
      'Test task',
      'Test description',
      false,
      new Date('2026-05-01T00:00:00Z'),
    );

    const mockRepository: TaskRepository = {
      save: vi.fn().mockResolvedValue(mockTask),
      findAll: vi.fn(),
    };

    const useCase = new CreateTaskUseCase(mockRepository);

    const dto: CreateTaskDTO = {
      title: 'Test task',
      description: 'Test description',
    };

    const result = await useCase.execute(dto);

    expect(result).toBe(mockTask);
    expect(result.title).toBe('Test task');
    expect(result.description).toBe('Test description');
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test task',
        description: 'Test description',
        completed: false,
      }),
    );
  });

  it('should use empty string as default description', async () => {
    const mockRepository: TaskRepository = {
      save: vi.fn().mockImplementation(async (task: Task) => task),
      findAll: vi.fn(),
    };

    const useCase = new CreateTaskUseCase(mockRepository);

    const dto: CreateTaskDTO = { title: 'No description' };

    const result = await useCase.execute(dto);

    expect(result.description).toBe('');
    expect(result.completed).toBe(false);
  });

  it('should generate a unique id for each task', async () => {
    const savedTasks: Task[] = [];

    const mockRepository: TaskRepository = {
      save: vi.fn().mockImplementation(async (task: Task) => {
        savedTasks.push(task);
        return task;
      }),
      findAll: vi.fn(),
    };

    const useCase = new CreateTaskUseCase(mockRepository);

    await useCase.execute({ title: 'Task 1' });
    await useCase.execute({ title: 'Task 2' });

    expect(savedTasks).toHaveLength(2);
    expect(savedTasks[0]!.id).not.toBe(savedTasks[1]!.id);
  });
});
