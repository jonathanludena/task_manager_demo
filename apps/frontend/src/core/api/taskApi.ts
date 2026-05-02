import { env } from '../config/env';

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
}

const BASE_URL = env.API_URL;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const action = options?.method === 'POST'
      ? 'create task'
      : options?.method === 'PATCH'
        ? 'complete task'
        : 'fetch tasks';
    throw new Error(`Failed to ${action}`);
  }

  return response.json() as Promise<T>;
}

export interface FetchTasksParams {
  status?: 'completed' | 'pending';
  search?: string;
}

export const taskApi = {
  fetchTasks(params?: FetchTasksParams): Promise<TaskDTO[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    const url = `${BASE_URL}/tasks${qs ? `?${qs}` : ''}`;
    return request<TaskDTO[]>(url);
  },

  createTask(payload: CreateTaskPayload): Promise<TaskDTO> {
    return request<TaskDTO>(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  completeTask(id: string, completed: boolean = true): Promise<TaskDTO> {
    return request<TaskDTO>(`${BASE_URL}/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
  },
};
