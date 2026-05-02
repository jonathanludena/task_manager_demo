import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/renderWithProviders';
import { TaskListPage } from '../TaskListPage';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';

describe('TaskListPage', () => {
  beforeEach(() => {
    // Reset MSW handlers to defaults before each test
    server.resetHandlers();
  });

  it('shows loading state initially', () => {
    render(<TaskListPage />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renders tasks after loading', async () => {
    render(<TaskListPage />);

    await waitFor(() => {
      expect(screen.getByText('Learn TDD')).toBeInTheDocument();
    });

    expect(screen.getByText('Setup CI')).toBeInTheDocument();
  });

  it('shows the search input', async () => {
    render(<TaskListPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    server.use(
      http.get('*/tasks', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      }),
    );

    render(<TaskListPage />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar las tareas')).toBeInTheDocument();
    });
  });

  it('shows error message when complete fails', async () => {
    server.use(
      http.patch('*/tasks/:id/complete', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      }),
    );

    render(<TaskListPage />);

    // Wait for tasks to load first
    await waitFor(() => {
      expect(screen.getByText('Learn TDD')).toBeInTheDocument();
    });

    // Click toggle on first task - will fail due to mock
    const toggle = screen.getAllByRole('switch')[0]!;
    toggle.click();

    await waitFor(() => {
      expect(screen.getByText('Error al actualizar la tarea')).toBeInTheDocument();
    });
  });

  it('filters tasks based on status via API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(<TaskListPage />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Learn TDD')).toBeInTheDocument();
    });

    fetchSpy.mockClear();

    // Click "Completadas" filter
    const completedBtn = screen.getByRole('button', { name: 'Completadas' });
    completedBtn.click();

    // Should fetch with status=completed (or incomplete for pendientes - depends on mock)
    await waitFor(() => {
      // The mock uses 'completed' status filter
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/status=/),
        undefined,
      );
    });

    fetchSpy.mockRestore();
  });
});
