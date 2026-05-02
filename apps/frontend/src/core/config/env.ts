/// <reference types="vite/client" />

export const env = {
  API_URL: import.meta.env.VITE_API_URL as string,
} as const;

export type Env = typeof env;
