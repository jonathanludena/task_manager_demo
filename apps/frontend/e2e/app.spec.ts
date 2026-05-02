import { test, expect } from '@playwright/test';

test.describe('App shell', () => {
  test('debe mostrar el header con el título de la app', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Task Manager')).toBeVisible({ timeout: 10000 });
  });

  test('debe navegar a la página de creación desde el header', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /nueva tarea/i }).click();

    await expect(page).toHaveURL('/create');
  });

  test('debe mostrar el buscador de tareas', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible({ timeout: 10000 });
  });
});
