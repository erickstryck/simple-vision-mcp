import { describe, it, expect } from 'vitest';
import { withTimeout } from '../src/utils/withTimeout.js';

describe('withTimeout', () => {
  it('should resolve when promise resolves within timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await withTimeout(promise, 1000, 'Test operation');
    expect(result).toBe('success');
  });

  it('should propagate original error when promise rejects', async () => {
    const promise = Promise.reject(new Error('Original error'));
    await expect(withTimeout(promise, 1000, 'Test operation')).rejects.toThrow('Original error');
  });

  it('should handle non-AbortError with timeout', async () => {
    const promise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Network error')), 50);
    });

    await expect(withTimeout(promise, 1000, 'Test operation')).rejects.toThrow('Network error');
  });
});