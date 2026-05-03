import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import crypto from 'crypto';
import { env } from '../config/env';

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Burn time proportional to bufA to avoid leaking length info
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

async function securityPlugin(server: FastifyInstance): Promise<void> {
  // 1. CORS — must register before rate-limit so OPTIONS preflight isn't rate-limited
  await server.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // 2. Rate limiting
  await server.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    keyGenerator: (request) => request.ip,
  });

  // 3. Shared secret validation — "validate if present" strategy
  server.addHook('onRequest', async (request, reply) => {
    const header = request.headers['x-internal-secret'];

    // Absent header → allow (validate-if-present strategy)
    if (header === undefined) return;

    // Dev mode: empty INTERNAL_SECRET → skip validation
    if (env.INTERNAL_SECRET === '') return;

    // Coerce to string (header can be string | string[])
    const headerValue = Array.isArray(header) ? header[0] : header;

    // Header present: compare with configured secret
    if (!timingSafeEqual(headerValue, env.INTERNAL_SECRET)) {
      reply.status(403).send({ error: 'Forbidden' });
    }
  });
}

// Break Fastify encapsulation so CORS, rate-limit, and hooks apply to ALL routes,
// not just routes registered inside this plugin's scope.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(securityPlugin as any)[Symbol.for('skip-override')] = true;

export { securityPlugin };
