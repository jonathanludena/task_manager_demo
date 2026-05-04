import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import { TaskCard } from '../TaskCard';

describe('TaskCard', () => {
  const incompleteTask = {
    id: '1',
    title: 'Test task',
    description: 'Test description',
    completed: false,
    createdAt: '2026-05-01T00:00:00Z',
  };

  const completedTask = {
    id: '2',
    title: 'Done task',
    description: 'Already completed',
    completed: true,
    createdAt: '2026-05-01T00:00:00Z',
  };

  it('renders task title and description', () => {
    render(<TaskCard task={incompleteTask} onToggle={vi.fn()} />);

    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows a toggle switch for incomplete tasks', () => {
    render(<TaskCard task={incompleteTask} onToggle={vi.fn()} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('shows checked toggle for completed tasks', () => {
    render(<TaskCard task={completedTask} onToggle={vi.fn()} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onToggle when switch clicked', async () => {
    const onToggle = vi.fn();
    const { user } = render(<TaskCard task={incompleteTask} onToggle={onToggle} />);

    await user.click(screen.getByRole('switch'));

    expect(onToggle).toHaveBeenCalledWith('1', true);
  });

  it('calls onToggle with false for completed task', async () => {
    const onToggle = vi.fn();
    const { user } = render(<TaskCard task={completedTask} onToggle={onToggle} />);

    await user.click(screen.getByRole('switch'));

    expect(onToggle).toHaveBeenCalledWith('2', false);
  });

  it('shows completed title with line-through style', () => {
    render(<TaskCard task={completedTask} onToggle={vi.fn()} />);

    const title = screen.getByText('Done task');
    expect(title).toBeInTheDocument();
    expect(title.className).toContain('line-through');
  });

  it('shows "Pendiente" badge for incomplete tasks', () => {
    render(<TaskCard task={incompleteTask} onToggle={vi.fn()} />);

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('shows "Completada" badge for completed tasks', () => {
    render(<TaskCard task={completedTask} onToggle={vi.fn()} />);

    expect(screen.getByText('Completada')).toBeInTheDocument();
  });

  describe('onDelete prop', () => {
    it('renders a delete button when onDelete is provided', () => {
      render(<TaskCard task={incompleteTask} onToggle={vi.fn()} onDelete={vi.fn()} />);

      const deleteBtn = screen.getByRole('button', { name: /eliminar/i });
      expect(deleteBtn).toBeInTheDocument();
    });

    it('calls onDelete with task id when delete button is clicked', async () => {
      const onDelete = vi.fn();
      const { user } = render(
        <TaskCard task={incompleteTask} onToggle={vi.fn()} onDelete={onDelete} />,
      );

      const deleteBtn = screen.getByRole('button', { name: /eliminar/i });
      await user.click(deleteBtn);

      expect(onDelete).toHaveBeenCalledWith('1');
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('does not render delete button when onDelete is not provided', () => {
      render(<TaskCard task={incompleteTask} onToggle={vi.fn()} />);

      const deleteBtn = screen.queryByRole('button', { name: /eliminar/i });
      expect(deleteBtn).not.toBeInTheDocument();
    });
  });
});
