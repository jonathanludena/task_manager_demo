import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuración de Playwright para E2E testing del Frontend.
 *
 * Estrategia:
 * - webServer levanta el dev server de Vite automáticamente antes de los tests
 * - Solo Chromium (rápido para CI/local)
 * - Los tests van en `e2e/` con sufijo `.spec.ts`
 *
 * @see https://playwright.dev/docs/test-configuration
 */

// En entornos donde faltan librerías del sistema (ej. WSL2 Ubuntu),
// Playwright incluye un bundle de .so que podemos usar vía LD_LIBRARY_PATH.
const localLibsPath = join(__dirname, '.playwright-libs');
const ldLibPath = existsSync(localLibsPath) ? localLibsPath : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: ldLibPath
      ? {
          env: {
            ...process.env,
            LD_LIBRARY_PATH: `${ldLibPath}:${process.env.LD_LIBRARY_PATH ?? ''}`,
          },
        }
      : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    cwd: './',
  },
});
