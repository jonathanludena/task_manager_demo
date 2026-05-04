import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskApi } from '../taskApi';

const API_URL = 'http://localhost:3000';

vi.stubEnv('VITE_API_URL', API_URL);

describe('taskApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchTasks', () => {
    it('should fetch and return tasks', async () => {
      const tasks = [
        { id: '1', title: 'Task 1', description: 'Desc 1', completed: false, createdAt: '2026-01-01T00:00:00Z' },
      ];

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => tasks,
      } as Response);

      const result = await taskApi.fetchTasks();

      expect(result).toEqual(tasks);
      expect(fetch).toHaveBeenCalledWith(`${API_URL}/tasks`, undefined);
    });

    it('should throw on error response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(taskApi.fetchTasks()).rejects.toThrow('Failed to fetch tasks');
    });

    it('should pass query params for status filter', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await taskApi.fetchTasks({ status: 'completed' });

      expect(fetch).toHaveBeenCalledWith(`${API_URL}/tasks?status=completed`, undefined);
    });

    it('should pass query params for search filter', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await taskApi.fetchTasks({ search: 'test' });

      expect(fetch).toHaveBeenCalledWith(`${API_URL}/tasks?search=test`, undefined);
    });

    it('should pass both filters', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await taskApi.fetchTasks({ status: 'pending', search: 'test' });

      expect(fetch).toHaveBeenCalledWith(`${API_URL}/tasks?status=pending&search=test`, undefined);
    });
  });

  describe('createTask', () => {
    it('should POST and return created task', async () => {
      const newTask = { id: '1', title: 'New', description: 'Desc', completed: false, createdAt: '2026-01-01T00:00:00Z' };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => newTask,
      } as Response);

      const result = await taskApi.createTask({ title: 'New', description: 'Desc' });

      expect(result).toEqual(newTask);
      expect(fetch).toHaveBeenCalledWith(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New', description: 'Desc' }),
      });
    });

    it('should throw on error response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response);

      await expect(taskApi.createTask({ title: '' })).rejects.toThrow('Failed to create task');
    });
  });

  describe('completeTask', () => {
    it('should PATCH and return completed task', async () => {
      const completed = { id: '1', title: 'Task', description: '', completed: true, createdAt: '2026-01-01T00:00:00Z' };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => completed,
      } as Response);

      const result = await taskApi.completeTask('1');

      expect(result).toEqual(completed);
      expect(fetch).toHaveBeenCalledWith(`${API_URL}/tasks/1/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
    });

    it('should throw on error response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(taskApi.completeTask('999')).rejects.toThrow('Failed to complete task');
    });
  });

  describe('deleteTask', () => {
    it('should DELETE task and resolve on 204', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
      } as Response);

      await taskApi.deleteTask('1');

      expect(fetch).toHaveBeenCalledWith(`${API_URL}/tasks/1`, {
        method: 'DELETE',
      });
    });

    it('should throw when task not found (404)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(taskApi.deleteTask('999')).rejects.toThrow('Failed to delete task');
    });

    it('should throw on server error (500)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(taskApi.deleteTask('1')).rejects.toThrow('Failed to delete task');
    });
  });
});
