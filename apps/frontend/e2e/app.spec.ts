import { test, expect } from '@playwright/test';

test.describe('App shell', () => {
  test('debe mostrar el título en la barra lateral', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Task Manager' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('debe navegar a la página de creación desde el botón del header', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /nueva tarea/i }).click();

    await expect(page).toHaveURL('/create');
  });

  test('debe mostrar el buscador de tareas', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible({ timeout: 10000 });
  });
});
