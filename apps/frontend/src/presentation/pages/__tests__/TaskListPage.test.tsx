import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/renderWithProviders';
import { TaskListPage } from '../TaskListPage';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';

describe('TaskListPage', () => {
  beforeEach(() => {
    // Reset MSW handlers to defaults before each test
    server.resetHandlers();
    // Clear MSW localStorage to reset task data
    localStorage.removeItem('msw_tasks');
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

  describe('delete flow', () => {
    it('opens AlertDialog on delete click and cancels without removing task', async () => {
      render(<TaskListPage />);

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByText('Learn TDD')).toBeInTheDocument();
      });

      // Click delete button on first task
      const deleteBtns = screen.getAllByRole('button', { name: /eliminar/i });
      deleteBtns[0]!.click();

      // AlertDialog should appear
      await waitFor(() => {
        expect(screen.getByText('Eliminar tarea')).toBeInTheDocument();
      });

      // Click cancel
      const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
      cancelBtn.click();

      // Wait for dialog to close fully
      await waitFor(() => {
        expect(screen.queryByText('Eliminar tarea')).not.toBeInTheDocument();
      });

      // Task should still be rendered
      expect(screen.getByText('Learn TDD')).toBeInTheDocument();
    });

    it('deletes task on confirm and removes it from DOM', async () => {
      render(<TaskListPage />);

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByText('Learn TDD')).toBeInTheDocument();
      });

      // Click delete button on first task
      const deleteBtns = screen.getAllByRole('button', { name: /eliminar/i });
      deleteBtns[0]!.click();

      // AlertDialog should appear
      await waitFor(() => {
        expect(screen.getByText('Eliminar tarea')).toBeInTheDocument();
      });

      // Confirm delete
      const confirmBtn = screen.getByRole('button', { name: /^Confirmar$/i });
      confirmBtn.click();

      // Wait for dialog to close
      await waitFor(() => {
        expect(screen.queryByText('Eliminar tarea')).not.toBeInTheDocument();
      });

      // Task should be removed from DOM
      await waitFor(() => {
        expect(screen.queryByText('Learn TDD')).not.toBeInTheDocument();
      });

      // Second task should still be there
      expect(screen.getByText('Setup CI')).toBeInTheDocument();
    });

    it('shows error and restores task when delete API fails', async () => {
      server.use(
        http.delete('*/tasks/:id', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        }),
      );

      render(<TaskListPage />);

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByText('Learn TDD')).toBeInTheDocument();
      });

      // Click delete button on first task
      const deleteBtns = screen.getAllByRole('button', { name: /eliminar/i });
      deleteBtns[0]!.click();

      // AlertDialog should appear
      await waitFor(() => {
        expect(screen.getByText('Eliminar tarea')).toBeInTheDocument();
      });

      // Confirm delete
      const confirmBtn = screen.getByRole('button', { name: /^Confirmar$/i });
      confirmBtn.click();

      // Wait for dialog to close
      await waitFor(() => {
        expect(screen.queryByText('Eliminar tarea')).not.toBeInTheDocument();
      });

      // Error message should appear
      await waitFor(() => {
        expect(screen.getByText('Error al eliminar la tarea')).toBeInTheDocument();
      });

      // Task should be restored (still visible)
      expect(screen.getByText('Learn TDD')).toBeInTheDocument();
    });
  });
});
