import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../server';

describe('Health route', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it('GET /health should return status ok', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('GET /health should include CORS headers when Origin header present', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://app-challenge-0526.lproconsulting.com' },
    });

    expect(response.statusCode).toBe(200);
    // After securityPlugin is registered, CORS headers should be present
    expect(response.headers['access-control-allow-origin']).toBe('https://app-challenge-0526.lproconsulting.com');
  });
});
