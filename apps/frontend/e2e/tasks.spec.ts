import { test, expect } from '@playwright/test';

test.describe('Task Management - E2E Flows', () => {

  test.describe('Task List Page', () => {
    test('debe mostrar la lista de tareas con datos mock', async ({ page }) => {
      await page.goto('/');

      // MSW devuelve 2 tareas mock (Learn TDD, Setup CI)
      await expect(page.getByText('Learn TDD')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Setup CI')).toBeVisible();
    });

    test('debe mostrar el botón para crear nueva tarea', async ({ page }) => {
      await page.goto('/');

      const newTaskLink = page.getByRole('link', { name: /nueva tarea/i });
      await expect(newTaskLink).toBeVisible();
    });

    test('debe navegar a la página de creación al hacer click en Nueva Tarea', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('link', { name: /nueva tarea/i }).click();

      await expect(page).toHaveURL('/create');
      await expect(page.getByText('Nueva Tarea')).toBeVisible();
    });

    test('debe mostrar tarea completada con badge', async ({ page }) => {
      await page.goto('/');

      // Setup CI es la tarea completada en los handlers mock
      await expect(page.getByText('Completada')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Task Create Page', () => {
    test('debe mostrar el formulario de creación', async ({ page }) => {
      await page.goto('/create');

      await expect(page.getByLabel(/título/i)).toBeVisible();
      await expect(page.getByLabel(/descripción/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /crear tarea/i })).toBeVisible();
    });

    test('debe crear una tarea y redirigir al listado', async ({ page }) => {
      await page.goto('/create');

      await page.getByLabel(/título/i).fill('Mi nueva tarea E2E');
      await page.getByLabel(/descripción/i).fill('Descripción de prueba');
      await page.getByRole('button', { name: /crear tarea/i }).click();

      // Debe redirigir a /
      await expect(page).toHaveURL('/');
      // La tarea se agregó al array mock, debería aparecer
      await expect(page.getByText('Mi nueva tarea E2E')).toBeVisible({ timeout: 10000 });
    });

    test('debe mostrar error de validación si el título está vacío', async ({ page }) => {
      await page.goto('/create');

      await page.getByRole('button', { name: /crear tarea/i }).click();

      await expect(page.getByText(/el título es requerido/i)).toBeVisible();
    });

    test('debe crear tarea sin descripción', async ({ page }) => {
      await page.goto('/create');

      await page.getByLabel(/título/i).fill('Solo título');
      await page.getByRole('button', { name: /crear tarea/i }).click();

      await expect(page).toHaveURL('/');
      await expect(page.getByText('Solo título')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Full Flow: Create → List → View', () => {
    test('flujo completo: navegar, crear tarea, ver en listado', async ({ page }) => {
      // 1. Ir al listado
      await page.goto('/');
      await expect(page.getByText('Learn TDD')).toBeVisible({ timeout: 10000 });

      // 2. Ir a crear
      await page.getByRole('link', { name: /nueva tarea/i }).click();
      await expect(page).toHaveURL('/create');

      // 3. Crear tarea
      await page.getByLabel(/título/i).fill('Flujo completo E2E');
      await page.getByLabel(/descripción/i).fill('Test del flujo completo');
      await page.getByRole('button', { name: /crear tarea/i }).click();

      // 4. Volver al listado y ver la tarea creada
      await expect(page).toHaveURL('/');
      await expect(page.getByText('Flujo completo E2E')).toBeVisible({ timeout: 10000 });
    });
  });
});
