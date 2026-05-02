import Fastify from 'fastify';
import { healthRoute } from './routes/health';

export function buildServer() {
  const server = Fastify({ logger: true });

  server.register(healthRoute);

  return server;
}
