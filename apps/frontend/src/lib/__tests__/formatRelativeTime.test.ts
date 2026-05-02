import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime, formatRelativeTimeShort } from '../formatRelativeTime';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Ahora mismo" for dates less than a minute ago', () => {
    expect(formatRelativeTime(new Date('2026-05-02T11:59:45Z').toISOString())).toBe('Ahora mismo');
  });

  it('returns "Hace 1 minuto" for one minute ago', () => {
    expect(formatRelativeTime(new Date('2026-05-02T11:59:00Z').toISOString())).toBe('Hace 1 minuto');
  });

  it('returns "Hace X minutos" for multiple minutes', () => {
    expect(formatRelativeTime(new Date('2026-05-02T11:55:00Z').toISOString())).toBe('Hace 5 minutos');
  });

  it('returns "Hace 1 hora" for one hour ago', () => {
    expect(formatRelativeTime(new Date('2026-05-02T11:00:00Z').toISOString())).toBe('Hace 1 hora');
  });

  it('returns "Hace X horas" for 2-3 hours ago', () => {
    expect(formatRelativeTime(new Date('2026-05-02T09:30:00Z').toISOString())).toBe('Hace 2 horas');
  });

  it('returns "Hoy HH:MM" for today but more than 3 hours ago', () => {
    // 8 AM is 4 hours ago
    const result = formatRelativeTime(new Date('2026-05-02T08:00:00Z').toISOString());
    expect(result).toMatch(/^Hoy \d{2}:\d{2}$/);
  });

  it('returns "Ayer HH:MM" for yesterday', () => {
    const result = formatRelativeTime(new Date('2026-05-01T15:00:00Z').toISOString());
    expect(result).toMatch(/^Ayer \d{2}:\d{2}$/);
  });

  it('returns date string for older dates', () => {
    const result = formatRelativeTime(new Date('2026-04-28T10:00:00Z').toISOString());
    expect(result).toMatch(/^\d{1,2} [a-z]{3} \d{2}:\d{2}$/i);
  });
});

describe('formatRelativeTimeShort', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Ahora" for recent dates', () => {
    expect(formatRelativeTimeShort(new Date('2026-05-02T11:59:50Z').toISOString())).toBe('Ahora');
  });

  it('returns minutes with "m" suffix', () => {
    expect(formatRelativeTimeShort(new Date('2026-05-02T11:55:00Z').toISOString())).toBe('5m');
  });

  it('returns hours with "h" suffix', () => {
    expect(formatRelativeTimeShort(new Date('2026-05-02T10:00:00Z').toISOString())).toBe('2h');
  });

  it('returns short date for older dates', () => {
    const result = formatRelativeTimeShort(new Date('2026-04-28T10:00:00Z').toISOString());
    expect(result).toMatch(/^\d{1,2} [a-z]{3}$/i);
  });
});
