import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/renderWithProviders';
import { Sidebar } from '../Sidebar';

vi.mock('@/core/api/taskApi', () => ({
  taskApi: {
    fetchTasks: vi.fn(),
  },
}));

import { taskApi } from '@/core/api/taskApi';

const mockFetchTasks = vi.mocked(taskApi.fetchTasks);

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links', () => {
    mockFetchTasks.mockResolvedValue([]);
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /tareas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /nueva tarea/i })).toBeInTheDocument();
  });

  it('shows "Sin tareas" when API returns empty', async () => {
    mockFetchTasks.mockResolvedValue([]);
    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByText('Sin tareas')).toBeInTheDocument();
    });
  });

  it('fetches stats and shows progress', async () => {
    mockFetchTasks.mockResolvedValue([
      { id: '1', title: 'T1', description: '', completed: true, createdAt: new Date().toISOString() },
      { id: '2', title: 'T2', description: '', completed: false, createdAt: new Date().toISOString() },
      { id: '3', title: 'T3', description: '', completed: false, createdAt: new Date().toISOString() },
    ]);

    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByText('1 de 3 tareas')).toBeInTheDocument();
    });
  });

  it('renders work hours clock section', () => {
    mockFetchTasks.mockResolvedValue([]);
    render(<Sidebar />);

    expect(screen.getByText('Jornada Laboral')).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    mockFetchTasks.mockRejectedValue(new Error('Network error'));

    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByText('Sin tareas')).toBeInTheDocument();
    });
  });
});
