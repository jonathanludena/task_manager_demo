import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notifyTasksUpdated, onTasksUpdated } from '../taskEvents';

describe('taskEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('notifyTasksUpdated dispatches a custom event on window', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    const callback = vi.fn();
    window.addEventListener('tasks-updated', callback);

    notifyTasksUpdated();

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tasks-updated' }),
    );
    addEventListenerSpy.mockRestore();
    dispatchEventSpy.mockRestore();
  });

  it('onTasksUpdated subscribes to tasks-updated event', () => {
    const callback = vi.fn();
    const unsubscribe = onTasksUpdated(callback);

    window.dispatchEvent(new CustomEvent('tasks-updated'));

    expect(callback).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('onTasksUpdated returns unsubscribe function that removes listener', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const callback = vi.fn();

    const unsubscribe = onTasksUpdated(callback);
    unsubscribe();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('tasks-updated', callback);
    removeEventListenerSpy.mockRestore();
  });

  it('notifyTasksUpdated does not throw when window is undefined', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - simulating non-browser environment
    delete globalThis.window;

    expect(() => notifyTasksUpdated()).not.toThrow();

    globalThis.window = originalWindow;
  });

  it('onTasksUpdated returns noop when window is undefined', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - simulating non-browser environment
    delete globalThis.window;

    const callback = vi.fn();
    const unsubscribe = onTasksUpdated(callback);

    expect(typeof unsubscribe).toBe('function');
    unsubscribe(); // should not throw

    globalThis.window = originalWindow;
  });
});
