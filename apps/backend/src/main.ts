import 'reflect-metadata';
import { buildServer } from './infrastructure/server';
import { env } from './infrastructure/config/env';

async function start(): Promise<void> {
  const server = buildServer();

  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
    server.log.info(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
