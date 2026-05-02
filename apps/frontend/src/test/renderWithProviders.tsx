import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/presentation/components/atoms/ThemeProvider';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ThemeProvider>
  );
}

interface CustomRenderResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>;
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): CustomRenderResult => {
  return {
    ...render(ui, { wrapper: AllTheProviders, ...options }),
    user: userEvent.setup(),
  };
};

export * from '@testing-library/react';
export { customRender as render };
