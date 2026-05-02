import 'reflect-metadata';
import { buildServer } from './infrastructure/server';
import { env } from './infrastructure/config/env';
import { AppDataSource } from './infrastructure/database/dataSource';

async function start(): Promise<void> {
  await AppDataSource.initialize();
  const server = buildServer();

  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
    server.log.info(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
    server.log.info(`Database connected: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
  } catch (err) {
    const log = server?.log ?? console;
    log.error(err);
    process.exit(1);
  }
}

start();
