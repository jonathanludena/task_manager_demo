import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { Task } from '../../../domain/entities/Task';
import { CreateTaskUseCase } from '../../../application/usecases/CreateTask';
import { GetAllTasksUseCase } from '../../../application/usecases/GetAllTasks';
import { MarkTaskCompleteUseCase } from '../../../application/usecases/MarkTaskComplete';
import type { TaskRepository } from '../../../domain/repositories/TaskRepository';
import { buildTaskRoutes } from '../tasks';

function buildTestServer(repository: TaskRepository): FastifyInstance {
  const server = Fastify({ logger: false });

  server.register(
    buildTaskRoutes(
      new CreateTaskUseCase(repository),
      new GetAllTasksUseCase(repository),
      new MarkTaskCompleteUseCase(repository),
    ),
  );

  return server;
}

describe('Task routes', () => {
  let server: FastifyInstance;

  afterAll(async () => {
    await server?.close();
  });

  describe('POST /tasks', () => {
    beforeEach(() => {
      server = buildTestServer({
        save: vi.fn().mockImplementation(async (task: Task) => task),
        findAll: vi.fn(),
        findById: vi.fn(),
      });
    });

    afterEach(async () => {
      await server.close();
    });

    it('should create a task and return 201', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'New task', description: 'A description' },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.title).toBe('New task');
      expect(body.description).toBe('A description');
      expect(body.completed).toBe(false);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('createdAt');
    });

    it('should return 400 when title is missing', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/tasks',
        payload: { description: 'No title' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /tasks', () => {
    it('should return an empty array when no tasks exist', async () => {
      server = buildTestServer({
        save: vi.fn(),
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn(),
      });

      const response = await server.inject({
        method: 'GET',
        url: '/tasks',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
      await server.close();
    });

    it('should return all tasks', async () => {
      const tasks = [
        new Task('1', 'Task 1', 'Desc 1', false, new Date('2026-01-01')),
        new Task('2', 'Task 2', 'Desc 2', true, new Date('2026-01-02')),
      ];

      server = buildTestServer({
        save: vi.fn(),
        findAll: vi.fn().mockResolvedValue(tasks),
        findById: vi.fn(),
      });

      const response = await server.inject({
        method: 'GET',
        url: '/tasks',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveLength(2);
      expect(body[0]!.title).toBe('Task 1');
      expect(body[1]!.title).toBe('Task 2');
      await server.close();
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    it('should mark a task as complete and return 200', async () => {
      const existingTask = new Task('abc-123', 'My task', 'Desc', false, new Date('2026-01-01'));

      server = buildTestServer({
        save: vi.fn().mockImplementation(async (task: Task) => task),
        findAll: vi.fn(),
        findById: vi.fn().mockResolvedValue(existingTask),
      });

      const response = await server.inject({
        method: 'PATCH',
        url: '/tasks/abc-123/complete',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.completed).toBe(true);
      expect(body.id).toBe('abc-123');
      await server.close();
    });

    it('should return 404 when task does not exist', async () => {
      server = buildTestServer({
        save: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn().mockResolvedValue(null),
      });

      const response = await server.inject({
        method: 'PATCH',
        url: '/tasks/nonexistent/complete',
      });

      expect(response.statusCode).toBe(404);
      await server.close();
    });
  });
});
