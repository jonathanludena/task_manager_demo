import 'dotenv/config';

function getEnvVar(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

function getEnvVarAsNumber(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export const env = {
  PORT: getEnvVarAsNumber('PORT', 3000),
  DB_HOST: getEnvVar('DB_HOST', 'localhost'),
  DB_PORT: getEnvVarAsNumber('DB_PORT', 5432),
  DB_USER: getEnvVar('DB_USER', 'postgres'),
  DB_PASSWORD: getEnvVar('DB_PASSWORD', 'postgres'),
  DB_NAME: getEnvVar('DB_NAME', 'task_manager'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
} as const;

export type Env = typeof env;
