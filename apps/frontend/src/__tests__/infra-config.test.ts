// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─────────────────────────────────────────────────────────────
// TASK-5: nginx.conf — X-Internal-Secret header injection
// ─────────────────────────────────────────────────────────────

describe('nginx.conf — shared secret header injection (TASK-5)', () => {
  const configPath = resolve(__dirname, '../../nginx.conf');
  const config = readFileSync(configPath, 'utf8');

  /** Extract the nginx location block for a given path matching EXACTLY. */
  function extractLocationBlock(content: string, location: string): string {
    const lines = content.split('\n');
    // Match "location /" but not "location /tasks" when looking for root
    const pattern = location === '/'
      ? /^\s*location\s+\/\s*\{/
      : new RegExp(`^\\s*location\\s+${escapeRegex(location)}\\s*\\{`);
    const startIdx = lines.findIndex((l) => pattern.test(l));
    if (startIdx === -1) return '';
    const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim() === '}');
    if (endIdx === -1) return '';
    return lines.slice(startIdx, endIdx + 1).join('\n');
  }

  function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  it('has proxy_set_header X-Internal-Secret in /tasks location block', () => {
    const block = extractLocationBlock(config, '/tasks');
    expect(block).toContain('proxy_set_header X-Internal-Secret __INTERNAL_SECRET__;');
  });

  it('has proxy_set_header X-Internal-Secret in /health location block', () => {
    const block = extractLocationBlock(config, '/health');
    expect(block).toContain('proxy_set_header X-Internal-Secret __INTERNAL_SECRET__;');
  });

  it('does NOT inject X-Internal-Secret into the root SPA location', () => {
    const block = extractLocationBlock(config, '/');
    expect(block).not.toContain('X-Internal-Secret');
  });
});

// ─────────────────────────────────────────────────────────────
// TASK-6: Dockerfile — INTERNAL_SECRET env substitution
// ─────────────────────────────────────────────────────────────

describe('Dockerfile — INTERNAL_SECRET substitution (TASK-6)', () => {
  const dockerfilePath = resolve(__dirname, '../../Dockerfile');
  const dockerfile = readFileSync(dockerfilePath, 'utf8');

  /** Return the full multi-line CMD instruction from the Dockerfile. */
  function getFullCmd(content: string): string {
    const lines = content.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().startsWith('CMD ')) {
        // Collect continuation lines (ending with \)
        let j = i;
        while (lines[j] && lines[j].trimEnd().endsWith('\\')) {
          j++;
        }
        return lines.slice(i, j + 1).join('\n');
      }
    }
    return '';
  }

  it('CMD declares INTERNAL_SECRET env variable', () => {
    const cmd = getFullCmd(dockerfile);
    expect(cmd).toContain('INTERNAL_SECRET');
    expect(cmd).toMatch(/\$\{INTERNAL_SECRET:-([^}]*)\}/);
  });

  it('CMD substitutes __INTERNAL_SECRET__ in sed command', () => {
    const cmd = getFullCmd(dockerfile);
    expect(cmd).toContain('s/__INTERNAL_SECRET__/$INTERNAL_SECRET/g');
  });

  it('CMD still substitutes __API_HOST__ (existing behavior preserved)', () => {
    const cmd = getFullCmd(dockerfile);
    expect(cmd).toContain('s/__API_HOST__/$API_HOST/g');
  });
});
