import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/renderWithProviders';
import { Button, buttonVariants } from '@/components/ui/button';

describe('Button component', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Styled</Button>);
    const button = screen.getByRole('button', { name: /styled/i });
    expect(button).toHaveClass('custom-class');
  });

  it('exports buttonVariants utility', () => {
    // buttonVariants should return a string of classes for a given variant
    const classes = buttonVariants({ variant: 'default', size: 'default' });
    expect(typeof classes).toBe('string');
    expect(classes).toContain('inline-flex');
  });

  it('renders multiple variant classes correctly', () => {
    const defaultClasses = buttonVariants({ variant: 'default', size: 'default' });
    const outlineClasses = buttonVariants({ variant: 'outline', size: 'sm' });

    expect(defaultClasses).not.toBe(outlineClasses);
    expect(outlineClasses).toContain('border-border');
  });
});
