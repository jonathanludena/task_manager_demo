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
    render(<TaskCard task={incompleteTask} onComplete={vi.fn()} />);

    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows complete button for incomplete tasks', () => {
    render(<TaskCard task={incompleteTask} onComplete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /completar/i })).toBeInTheDocument();
  });

  it('shows completed badge for completed tasks', () => {
    render(<TaskCard task={completedTask} onComplete={vi.fn()} />);

    expect(screen.getByText(/completada/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /completar/i })).not.toBeInTheDocument();
  });

  it('calls onComplete when button clicked', async () => {
    const onComplete = vi.fn();
    const { user } = render(<TaskCard task={incompleteTask} onComplete={onComplete} />);

    await user.click(screen.getByRole('button', { name: /completar/i }));

    expect(onComplete).toHaveBeenCalledWith('1');
  });

  it('displays creation date', () => {
    render(<TaskCard task={incompleteTask} onComplete={vi.fn()} />);

    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});
