import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import { TaskList } from '../TaskList';

const tasks = [
  { id: '1', title: 'Task 1', description: 'Desc 1', completed: false, createdAt: '2026-05-01T00:00:00Z' },
  { id: '2', title: 'Task 2', description: 'Desc 2', completed: true, createdAt: '2026-05-01T00:00:00Z' },
];

describe('TaskList', () => {
  it('renders a list of tasks', () => {
    render(<TaskList tasks={tasks} onComplete={vi.fn()} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('renders empty message when no tasks', () => {
    render(<TaskList tasks={[]} onComplete={vi.fn()} />);

    expect(screen.getByText(/no hay tareas/i)).toBeInTheDocument();
  });

  it('renders both incomplete and completed tasks', () => {
    render(<TaskList tasks={tasks} onComplete={vi.fn()} />);

    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(2);
    expect(switches[0]).toHaveAttribute('aria-checked', 'false');
    expect(switches[1]).toHaveAttribute('aria-checked', 'true');
  });

  describe('onDelete prop', () => {
    it('forwards onDelete to TaskCard and renders delete buttons', () => {
      render(<TaskList tasks={tasks} onComplete={vi.fn()} onDelete={vi.fn()} />);

      const deleteBtns = screen.getAllByRole('button', { name: /eliminar/i });
      expect(deleteBtns).toHaveLength(2);
    });

    it('calls onDelete with task id when delete is clicked', async () => {
      const onDelete = vi.fn();
      const { user } = render(
        <TaskList tasks={tasks} onComplete={vi.fn()} onDelete={onDelete} />,
      );

      const deleteBtns = screen.getAllByRole('button', { name: /eliminar/i });
      await user.click(deleteBtns[0]!);

      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('does not render delete buttons when onDelete is not provided', () => {
      render(<TaskList tasks={tasks} onComplete={vi.fn()} />);

      const deleteBtns = screen.queryAllByRole('button', { name: /eliminar/i });
      expect(deleteBtns).toHaveLength(0);
    });
  });
});
