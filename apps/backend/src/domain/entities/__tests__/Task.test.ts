import { describe, it, expect } from 'vitest';
import { Task } from '../Task';

describe('Task entity', () => {
  it('should create a task with all properties', () => {
    const now = new Date('2026-05-01T00:00:00Z');
    const task = new Task(
      'abc-123',
      'Test title',
      'Test description',
      false,
      now,
    );

    expect(task.id).toBe('abc-123');
    expect(task.title).toBe('Test title');
    expect(task.description).toBe('Test description');
    expect(task.completed).toBe(false);
    expect(task.createdAt).toBe(now);
  });

  it('should create a completed task', () => {
    const task = new Task(
      'def-456',
      'Completed task',
      '',
      true,
      new Date(),
    );

    expect(task.completed).toBe(true);
    expect(task.title).toBe('Completed task');
  });

  it('should preserve readonly properties', () => {
    const task = new Task('xyz-789', 'Readonly', '', false, new Date());

    // TypeScript enforces readonly at compile time
    expect(task.id).toBe('xyz-789');
    expect(task.title).toBe('Readonly');
    expect(task.completed).toBe(false);
  });
});
