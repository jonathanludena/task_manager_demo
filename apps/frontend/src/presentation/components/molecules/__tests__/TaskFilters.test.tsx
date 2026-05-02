import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import { TaskFilters } from '../TaskFilters';

describe('TaskFilters', () => {
  const defaultProps = {
    search: '',
    status: '',
    onSearchChange: vi.fn(),
    onStatusChange: vi.fn(),
  };

  it('renders search input', () => {
    render(<TaskFilters {...defaultProps} />);

    expect(screen.getByPlaceholderText(/buscar tareas/i)).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<TaskFilters {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pendientes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completadas' })).toBeInTheDocument();
  });

  it('shows the active filter button highlighted', () => {
    render(<TaskFilters {...defaultProps} status="completed" />);

    const completedBtn = screen.getByRole('button', { name: 'Completadas' });
    expect(completedBtn.className).toContain('bg-blue-600');
  });

  it('Todas is highlighted when status is empty', () => {
    render(<TaskFilters {...defaultProps} status="" />);

    const todasBtn = screen.getByRole('button', { name: 'Todas' });
    expect(todasBtn.className).toContain('bg-blue-600');
  });

  it('calls onSearchChange when typing in search', async () => {
    const onSearchChange = vi.fn();
    const { user } = render(
      <TaskFilters {...defaultProps} onSearchChange={onSearchChange} />,
    );

    const input = screen.getByPlaceholderText(/buscar tareas/i);
    await user.type(input, 'test');

    expect(onSearchChange).toHaveBeenCalled();
  });

  it('calls onStatusChange when clicking a filter button', async () => {
    const onStatusChange = vi.fn();
    const { user } = render(
      <TaskFilters {...defaultProps} onStatusChange={onStatusChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Completadas' }));

    expect(onStatusChange).toHaveBeenCalledWith('completed');
  });
});
