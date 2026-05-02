import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/renderWithProviders';
import { TaskCreatePage } from '../TaskCreatePage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock taskApi
vi.mock('@/core/api/taskApi', () => ({
  taskApi: {
    createTask: vi.fn(),
  },
}));

import { taskApi } from '@/core/api/taskApi';

describe('TaskCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form', () => {
    render(<TaskCreatePage />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it('creates task and navigates to list on submit', async () => {
    const mockCreateTask = vi.mocked(taskApi.createTask).mockResolvedValue({
      id: '1',
      title: 'New task',
      description: 'Desc',
      completed: false,
      createdAt: '2026-05-01T00:00:00Z',
    });

    const { user } = render(<TaskCreatePage />);

    await user.type(screen.getByLabelText(/título/i), 'New task');
    await user.type(screen.getByLabelText(/descripción/i), 'Desc');
    await user.click(screen.getByRole('button', { name: /crear tarea/i }));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({ title: 'New task', description: 'Desc' });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows error when creation fails', async () => {
    vi.mocked(taskApi.createTask).mockRejectedValue(new Error('Failed'));

    const { user } = render(<TaskCreatePage />);

    await user.type(screen.getByLabelText(/título/i), 'Task');
    await user.click(screen.getByRole('button', { name: /crear tarea/i }));

    await waitFor(() => {
      expect(screen.getByText(/error al crear/i)).toBeInTheDocument();
    });
  });
});
