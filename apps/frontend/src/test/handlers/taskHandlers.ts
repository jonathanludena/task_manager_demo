import { http, HttpResponse } from 'msw';

interface TaskDTO {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

const tasks: TaskDTO[] = [
  {
    id: '1',
    title: 'Learn TDD',
    description: 'Write tests first, then code',
    completed: false,
    createdAt: '2026-05-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Setup CI',
    description: 'Configure GitHub Actions',
    completed: true,
    createdAt: '2026-05-01T00:00:00Z',
  },
];

export const handlers = [
  http.get('*/tasks', () => {
    return HttpResponse.json(tasks);
  }),

  http.post('*/tasks', async ({ request }) => {
    const body = (await request.json()) as { title: string; description?: string };

    if (!body.title) {
      return HttpResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newTask: TaskDTO = {
      id: String(Date.now()),
      title: body.title,
      description: body.description ?? '',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.patch('*/tasks/:id/complete', ({ params }) => {
    const task = tasks.find((t) => t.id === params.id);

    if (!task) {
      return HttpResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    task.completed = true;

    return HttpResponse.json(task);
  }),
];
