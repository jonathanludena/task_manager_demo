import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import { Layout } from '../Layout';

vi.mock('@/core/api/taskApi', () => ({
  taskApi: {
    fetchTasks: vi.fn().mockResolvedValue([]),
  },
}));

describe('Layout', () => {
  it('renders the header with "Task Manager" link', () => {
    render(<Layout />);

    // Header renders "Task Manager" as a link
    const links = screen.getAllByRole('link', { name: 'Task Manager' });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toBeInTheDocument();
  });

  it('renders header "Nueva Tarea" button', () => {
    render(<Layout />);

    // The header has a "Nueva Tarea" button
    expect(screen.getByRole('button', { name: /nueva tarea/i })).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<Layout />);

    expect(screen.getByRole('button', { name: /cambiar tema/i })).toBeInTheDocument();
  });

  it('renders sidebar navigation area', () => {
    render(<Layout />);

    // Sidebar has "Tareas" navigation link
    const navLinks = screen.getAllByRole('link', { name: /tareas/i });
    expect(navLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders main content area', () => {
    const { container } = render(<Layout />);

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main!.className).toContain('overflow-y-auto');
  });
});
