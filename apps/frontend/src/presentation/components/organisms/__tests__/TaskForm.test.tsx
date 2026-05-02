import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import { TaskForm } from '../TaskForm';

describe('TaskForm', () => {
  it('renders title input and description textarea', () => {
    render(<TaskForm onSubmit={vi.fn()} isSubmitting={false} />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it('shows validation error when title is empty on submit', async () => {
    const { user } = render(<TaskForm onSubmit={vi.fn()} isSubmitting={false} />);

    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(screen.getByText(/el título es requerido/i)).toBeInTheDocument();
  });

  it('calls onSubmit with title and description', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<TaskForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText(/título/i), 'New task');
    await user.type(screen.getByLabelText(/descripción/i), 'Task description');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New task',
      description: 'Task description',
    });
  });

  it('disables submit button while submitting', () => {
    render(<TaskForm onSubmit={vi.fn()} isSubmitting={true} />);

    expect(screen.getByRole('button', { name: /creando/i })).toBeDisabled();
  });

  it('calls onSubmit with empty description when not provided', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<TaskForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText(/título/i), 'Only title');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Only title',
      description: '',
    });
  });
});
