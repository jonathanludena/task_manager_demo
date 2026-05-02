import { describe, it, expect } from 'vitest';
import { router } from '../router';

describe('router', () => {
  it('has correct route structure', () => {
    const routes = router.routes;

    expect(routes).toHaveLength(1);
    expect(routes[0]!.children).toHaveLength(3);

    const [rootRoute, createRoute, catchAllRoute] = routes[0]!.children!;

    expect(rootRoute!.path).toBe('/');
    expect(createRoute!.path).toBe('/create');
    expect(catchAllRoute!.path).toBe('*');
  });

  it('uses Layout as root element', () => {
    const routes = router.routes;
    const layoutRoute = routes[0];

    // Layout is an element, not a path route
    expect(layoutRoute!.path).toBeUndefined();
    expect(layoutRoute!.element).toBeDefined();
  });
});
