import Fastify from 'fastify';
import { securityPlugin } from './plugins/security';
import { healthRoute } from './routes/health';
import { buildTaskRoutes } from './routes/tasks';
import { CreateTaskUseCase } from '../application/usecases/CreateTask';
import { GetAllTasksUseCase } from '../application/usecases/GetAllTasks';
import { MarkTaskCompleteUseCase } from '../application/usecases/MarkTaskComplete';
import type { TaskRepository } from '../domain/repositories/TaskRepository';
import { TypeOrmTaskRepository } from './repositories/TypeOrmTaskRepository';
import { AppDataSource } from './database/dataSource';

export interface ServerDeps {
  createTask?: CreateTaskUseCase;
  getAllTasks?: GetAllTasksUseCase;
  markTaskComplete?: MarkTaskCompleteUseCase;
}

export function buildServer(deps?: ServerDeps) {
  const server = Fastify({ logger: true });

  const repo: TaskRepository = new TypeOrmTaskRepository(AppDataSource);

  // Security must register BEFORE routes so CORS preflight isn't rate-limited
  server.register(securityPlugin);
  server.register(healthRoute);
  server.register(
    buildTaskRoutes(
      deps?.createTask ?? new CreateTaskUseCase(repo),
      deps?.getAllTasks ?? new GetAllTasksUseCase(repo),
      deps?.markTaskComplete ?? new MarkTaskCompleteUseCase(repo),
    ),
  );

  return server;
}
