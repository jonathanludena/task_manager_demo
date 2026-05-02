import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import App from '../App';

describe('App shell', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });

  it('renders the counter button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /count is/i })).toBeInTheDocument();
  });

  it('increments counter on click', async () => {
    const { user } = render(<App />);

    const button = screen.getByRole('button', { name: /count is/i });
    expect(button).toHaveTextContent('Count is 0');

    await user.click(button);
    expect(button).toHaveTextContent('Count is 1');
  });
});
