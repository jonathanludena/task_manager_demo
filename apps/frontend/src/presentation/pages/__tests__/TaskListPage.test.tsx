import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/renderWithProviders';
import { TaskListPage } from '../TaskListPage';

describe('TaskListPage', () => {
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

  it('shows navigate to create button', async () => {
    render(<TaskListPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /nueva tarea/i })).toBeInTheDocument();
    });
  });
});
