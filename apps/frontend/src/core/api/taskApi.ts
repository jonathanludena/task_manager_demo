import { env } from '../config/env';
import type { TaskDTO, CreateTaskPayload, TaskFilters } from '@task-manager/shared';

// Re-export for backward compatibility with consumers
export type { TaskDTO, CreateTaskPayload, TaskFilters };

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
  fetchTasks(params?: TaskFilters): Promise<TaskDTO[]> {
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
