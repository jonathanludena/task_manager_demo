import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import { TaskPieChart } from '../TaskPieChart';

describe('TaskPieChart', () => {
  it('shows empty state when there are no tasks', () => {
    render(<TaskPieChart completed={0} pending={0} />);

    expect(screen.getByText('Sin tareas')).toBeInTheDocument();
  });

  it('shows 100% when all tasks are completed', () => {
    render(<TaskPieChart completed={5} pending={0} />);

    expect(screen.getByText('100% completa')).toBeInTheDocument();
    expect(screen.getByText('5 de 5 tareas')).toBeInTheDocument();
  });

  it('shows 0% when no tasks are completed', () => {
    render(<TaskPieChart completed={0} pending={3} />);

    expect(screen.getByText('0% completa')).toBeInTheDocument();
    expect(screen.getByText('0 de 3 tareas')).toBeInTheDocument();
  });

  it('shows partial progress', () => {
    render(<TaskPieChart completed={3} pending={2} />);

    expect(screen.getByText('60% completa')).toBeInTheDocument();
    expect(screen.getByText('3 de 5 tareas')).toBeInTheDocument();
  });

  it('renders an SVG element', () => {
    const { container } = render(<TaskPieChart completed={1} pending={1} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
