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

export const taskApi = {
  fetchTasks(): Promise<TaskDTO[]> {
    return request<TaskDTO[]>(`${BASE_URL}/tasks`);
  },

  createTask(payload: CreateTaskPayload): Promise<TaskDTO> {
    return request<TaskDTO>(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  completeTask(id: string): Promise<TaskDTO> {
    return request<TaskDTO>(`${BASE_URL}/tasks/${id}/complete`, {
      method: 'PATCH',
    });
  },
};
