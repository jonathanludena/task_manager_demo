import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import { ThemeContext } from '@/presentation/hooks/useTheme';
import { Header } from '../Header';
import { MemoryRouter } from 'react-router-dom';
import { render as pureRender } from '@testing-library/react';

describe('Header', () => {
  it('renders the app title link', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: 'Task Manager' })).toBeInTheDocument();
  });

  it('renders a link to create a new task', () => {
    render(<Header />);

    const createLink = screen.getByRole('link', { name: /nueva tarea/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute('href', '/create');
  });

  it('renders a theme toggle button', () => {
    render(<Header />);

    expect(screen.getByRole('button', { name: /cambiar tema/i })).toBeInTheDocument();
  });

  it('shows moon icon in light theme and sun icon in dark theme', () => {
    const { rerender } = pureRender(
      <ThemeContext value={{ theme: 'light', toggleTheme: () => {} }}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </ThemeContext>,
    );

    // Light theme shows moon icon (path with d="M20.354...")
    const lightBtn = screen.getByRole('button', { name: /cambiar tema/i });
    const lightSvg = lightBtn.querySelector('svg');
    expect(lightSvg?.innerHTML).toContain('M20.354');

    rerender(
      <ThemeContext value={{ theme: 'dark', toggleTheme: () => {} }}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </ThemeContext>,
    );

    // Dark theme shows sun icon (path with d="M12 3v1m0 16v1...")
    const darkBtn = screen.getByRole('button', { name: /cambiar tema/i });
    const darkSvg = darkBtn.querySelector('svg');
    expect(darkSvg?.innerHTML).toContain('M12 3v1m0');
  });
});
