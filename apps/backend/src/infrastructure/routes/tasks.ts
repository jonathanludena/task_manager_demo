import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { CreateTaskUseCase } from '../../application/usecases/CreateTask';
import type { GetAllTasksUseCase } from '../../application/usecases/GetAllTasks';
import type { MarkTaskCompleteUseCase } from '../../application/usecases/MarkTaskComplete';

interface CreateTaskBody {
  title: string;
  description?: string;
}

const createTaskSchema = {
  body: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
    },
  },
};

export function buildTaskRoutes(
  createTask: CreateTaskUseCase,
  getAllTasks: GetAllTasksUseCase,
  markTaskComplete: MarkTaskCompleteUseCase,
) {
  return async function (server: FastifyInstance): Promise<void> {
    server.post<{ Body: CreateTaskBody }>(
      '/tasks',
      { schema: createTaskSchema },
      async (request: FastifyRequest<{ Body: CreateTaskBody }>, reply: FastifyReply) => {
        const task = await createTask.execute({
          title: request.body.title,
          description: request.body.description,
        });

        return reply.status(201).send(task);
      },
    );

    server.get<{
      Querystring: { status?: string; search?: string };
    }>('/tasks', async (request: FastifyRequest<{ Querystring: { status?: string; search?: string } }>) => {
      const filters = {
        ...(request.query.status && { status: request.query.status as 'completed' | 'incomplete' }),
        ...(request.query.search && { search: request.query.search }),
      };

      const hasFilters = Object.keys(filters).length > 0;
      return getAllTasks.execute(hasFilters ? filters : undefined);
    });

    server.patch<{ Params: { id: string } }>(
      '/tasks/:id/complete',
      async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
      ) => {
        const task = await markTaskComplete.execute(request.params.id);

        if (!task) {
          return reply.status(404).send({ error: 'Task not found' });
        }

        return reply.send(task);
      },
    );
  };
}
