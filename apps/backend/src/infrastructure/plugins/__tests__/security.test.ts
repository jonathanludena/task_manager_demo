import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';

// Set env vars at the module level for the first server built.
// For subsequent servers with different env, we reset modules before dynamic import.
function setTestEnv(overrides?: Record<string, string | number>) {
  process.env.CORS_ORIGIN = String(overrides?.CORS_ORIGIN ?? 'https://test.example.com');
  process.env.RATE_LIMIT_MAX = String(overrides?.RATE_LIMIT_MAX ?? 3);
  process.env.RATE_LIMIT_WINDOW_MS = String(overrides?.RATE_LIMIT_WINDOW_MS ?? 60000);
  process.env.INTERNAL_SECRET = String(overrides?.INTERNAL_SECRET ?? 'test-secret');
}

async function buildServer(overrides?: Record<string, string | number>): Promise<FastifyInstance> {
  setTestEnv(overrides);

  // Reset modules so env.ts is re-evaluated with new process.env values.
  // This is necessary because env.ts caches values at import time.
  vi.resetModules();

  // Dynamic import to force fresh module resolution with our env vars
  const { securityPlugin } = await import('../security');

  const server = Fastify({ logger: false });
  await server.register(securityPlugin);
  server.get('/test', async () => ({ ok: true }));
  server.post('/test', async () => ({ ok: true }));
  await server.ready();
  return server;
}

describe('Security plugin', () => {
  describe('CORS', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
      server = await buildServer();
    });

    afterAll(async () => {
      await server.close();
    });

    it('should set Access-Control-Allow-Origin header when Origin matches', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
        headers: { origin: 'https://test.example.com' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('https://test.example.com');
    });

    it('should set Access-Control-Allow-Credentials to true when Origin matches', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
        headers: { origin: 'https://test.example.com' },
      });

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle OPTIONS preflight with correct CORS headers', async () => {
      const response = await server.inject({
        method: 'OPTIONS',
        url: '/test',
        headers: {
          origin: 'https://test.example.com',
          'access-control-request-method': 'POST',
        },
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('https://test.example.com');
    });
  });

  describe('Rate limiting', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
      server = await buildServer({ RATE_LIMIT_MAX: 3 });
    });

    afterAll(async () => {
      await server.close();
    });

    it('should allow requests within limit', async () => {
      for (let i = 0; i < 3; i++) {
        const response = await server.inject({
          method: 'GET',
          url: '/test',
        });
        expect(response.statusCode).toBe(200);
      }
    });

    it('should return 429 when rate limit exceeded', async () => {
      // First 3 requests (within limit) should pass
      for (let i = 0; i < 3; i++) {
        await server.inject({ method: 'GET', url: '/test' });
      }

      // 4th request should be rate-limited
      const response = await server.inject({
        method: 'GET',
        url: '/test',
      });

      expect(response.statusCode).toBe(429);
    });

    it('should NOT rate-limit OPTIONS preflight requests', async () => {
      const srv = await buildServer({ RATE_LIMIT_MAX: 1 });
      try {
        // First request: OPTIONS (should NOT count toward rate limit)
        const optResponse = await srv.inject({
          method: 'OPTIONS',
          url: '/test',
          headers: {
            origin: 'https://test.example.com',
            'access-control-request-method': 'POST',
          },
        });
        expect(optResponse.statusCode).toBe(204);

        // Second request: GET (should still pass since OPTIONS wasn't counted)
        const getResponse = await srv.inject({
          method: 'GET',
          url: '/test',
        });
        expect(getResponse.statusCode).toBe(200);
      } finally {
        await srv.close();
      }
    });
  });

  describe('Shared secret validation', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
      server = await buildServer({ INTERNAL_SECRET: 'test-secret' });
    });

    afterAll(async () => {
      await server.close();
    });

    it('should allow requests with correct X-Internal-Secret header', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
        headers: { 'x-internal-secret': 'test-secret' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ ok: true });
    });

    it('should reject requests with wrong X-Internal-Secret header (403)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
        headers: { 'x-internal-secret': 'wrong-secret' },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toEqual({ error: 'Forbidden' });
    });

    it('should allow requests WITHOUT X-Internal-Secret header (absent strategy)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ ok: true });
    });

    it('should allow wrong secret when INTERNAL_SECRET is empty (dev mode)', async () => {
      const devServer = await buildServer({ INTERNAL_SECRET: '' });
      try {
        const response = await devServer.inject({
          method: 'GET',
          url: '/test',
          headers: { 'x-internal-secret': 'any-secret-works' },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ ok: true });
      } finally {
        await devServer.close();
      }
    });

    it('should allow absent secret when INTERNAL_SECRET is empty (dev mode)', async () => {
      const devServer = await buildServer({ INTERNAL_SECRET: '' });
      try {
        const response = await devServer.inject({
          method: 'GET',
          url: '/test',
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ ok: true });
      } finally {
        await devServer.close();
      }
    });

    it('should reject matching-length but different secret', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
        headers: { 'x-internal-secret': 'test-secrez' }, // 11 chars, different from 'test-secret'
      });

      expect(response.statusCode).toBe(403);
    });
  });
});
