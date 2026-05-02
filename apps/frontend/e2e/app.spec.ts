import { test, expect } from '@playwright/test';

test.describe('App shell', () => {
  test('debe mostrar el título y el enlace a nueva tarea', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /mis tareas/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /nueva tarea/i })).toBeVisible();
  });

  test('debe navegar a la página de creación al hacer click', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /nueva tarea/i }).click();

    await expect(page).toHaveURL('/create');
  });
});
