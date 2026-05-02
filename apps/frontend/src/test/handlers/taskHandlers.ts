import { http, HttpResponse } from 'msw';

interface TaskDTO {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'msw_tasks';

function getTasks(): TaskDTO[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  }
  return [
    {
      id: '1',
      title: 'Learn TDD',
      description: 'Write tests first, then code',
      completed: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      title: 'Setup CI',
      description: 'Configure GitHub Actions',
      completed: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
}

function saveTasks(tasks: TaskDTO[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
}

export const handlers = [
  http.get('*/tasks', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    let filtered = getTasks();

    if (status === 'completed') {
      filtered = filtered.filter((t) => t.completed);
    } else if (status === 'pending') {
      filtered = filtered.filter((t) => !t.completed);
    }

    if (search) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return HttpResponse.json(filtered);
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

    const tasks = getTasks();
    tasks.push(newTask);
    saveTasks(tasks);

    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.patch('*/tasks/:id/complete', async ({ params, request }) => {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex((t) => t.id === params.id);

    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let completed = true;
    try {
      const body = (await request.json()) as { completed?: boolean };
      completed = body.completed ?? true;
    } catch {
      // no body or invalid JSON — default to complete
    }

    tasks[taskIndex]!.completed = completed;
    saveTasks(tasks);

    return HttpResponse.json(tasks[taskIndex]);
  }),
];
