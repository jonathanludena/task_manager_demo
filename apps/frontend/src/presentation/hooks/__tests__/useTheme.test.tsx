import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeContext, useTheme, type Theme } from '../useTheme';

describe('useTheme', () => {
  it('returns the theme from context', () => {
    function TestComponent() {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme}</div>;
    }

    render(
      <ThemeContext value={{ theme: 'dark' as Theme, toggleTheme: () => {} }}>
        <TestComponent />
      </ThemeContext>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('returns light theme by default when no provider', () => {
    function TestComponent() {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme}</div>;
    }

    render(<TestComponent />);

    // Default context value is 'light'
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('provides toggleTheme function from context', () => {
    let toggled = false;
    function TestComponent() {
      const { toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>Toggle</button>;
    }

    render(
      <ThemeContext value={{ theme: 'light' as Theme, toggleTheme: () => { toggled = true; } }}>
        <TestComponent />
      </ThemeContext>,
    );

    screen.getByRole('button').click();
    expect(toggled).toBe(true);
  });
});
