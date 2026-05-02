import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import { TaskForm } from '../TaskForm';

describe('TaskForm', () => {
  it('renders title input and description textarea', () => {
    render(<TaskForm onSubmit={vi.fn()} isSubmitting={false} />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it('shows validation error when title is too short', async () => {
    const { user } = render(<TaskForm onSubmit={vi.fn()} isSubmitting={false} />);

    // Escribir solo 1 carácter (menos de 3)
    const input = screen.getByLabelText(/título/i);
    await user.type(input, 'ab');

    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
  });

  it('calls onSubmit with title and description', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<TaskForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText(/título/i), 'Mi nueva tarea');
    await user.type(screen.getByLabelText(/descripción/i), 'Descripción de prueba');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Mi nueva tarea',
      description: 'Descripción de prueba',
    });
  });

  it('disables submit button while submitting', () => {
    render(<TaskForm onSubmit={vi.fn()} isSubmitting={true} />);

    expect(screen.getByRole('button', { name: /creando/i })).toBeDisabled();
  });

  it('calls onSubmit with empty description when not provided', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<TaskForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText(/título/i), 'Solo título válido');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Solo título válido',
      description: '',
    });
  });

  it('sanitizes SQL injection characters from title', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<TaskForm onSubmit={onSubmit} isSubmitting={false} />);

    const input = screen.getByLabelText(/título/i);
    await user.type(input, "Tarea'; DROP TABLE tasks;--");

    await user.click(screen.getByRole('button', { name: /crear/i }));

    // Los caracteres ' ; - deben ser eliminados; queda solo texto limpio
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Tarea DROP TABLE tasks',
      description: '',
    });
  });

  it('allows ñ, period and comma in title', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<TaskForm onSubmit={onSubmit} isSubmitting={false} />);

    const input = screen.getByLabelText(/título/i);
    await user.type(input, 'Tarea con ñ, punto y coma.');

    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Tarea con ñ, punto y coma.',
      description: '',
    });
  });

  it('shows character counter for description', () => {
    render(<TaskForm onSubmit={vi.fn()} isSubmitting={false} />);

    expect(screen.getByText('0/500')).toBeInTheDocument();
  });

  it('updates character counter when typing description', async () => {
    const { user } = render(<TaskForm onSubmit={vi.fn()} isSubmitting={false} />);

    const textarea = screen.getByLabelText(/descripción/i);
    await user.type(textarea, 'Hola');

    expect(screen.getByText('4/500')).toBeInTheDocument();
  });
});
