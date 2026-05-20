import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig } from '../src/config/index.js';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('should load config from environment variables', () => {
    process.env.VISION_API_KEY = 'test-key';
    process.env.VISION_BASE_URL = 'https://test.com/v1';
    process.env.VISION_MODEL = 'test-model';

    const config = loadConfig();

    expect(config.apiKey).toBe('test-key');
    expect(config.baseUrl).toBe('https://test.com/v1');
    expect(config.model).toBe('test-model');
  });

  it('should use fallback values for optional settings', () => {
    process.env.VISION_API_KEY = 'test-key';

    const config = loadConfig();

    expect(config.maxTokens).toBe(4096);
    expect(config.timeout).toBe(120);
  });

  it('should throw error when API key is missing', () => {
    delete process.env.VISION_API_KEY;
    delete process.env.OPENAI_API_KEY;

    expect(() => loadConfig()).toThrow('VISION_API_KEY or OPENAI_API_KEY environment variable is required');
  });

  it('should prefer VISION_* variables over OPENAI_* variables', () => {
    process.env.VISION_API_KEY = 'vision-key';
    process.env.OPENAI_API_KEY = 'openai-key';
    process.env.VISION_BASE_URL = 'https://vision.com/v1';
    process.env.OPENAI_BASE_URL = 'https://openai.com/v1';

    const config = loadConfig();

    expect(config.apiKey).toBe('vision-key');
    expect(config.baseUrl).toBe('https://vision.com/v1');
  });

  it('should use OPENAI_* variables when VISION_* are not set', () => {
    process.env.OPENAI_API_KEY = 'openai-key';
    process.env.OPENAI_BASE_URL = 'https://openai.com/v1';
    process.env.OPENAI_MODEL = 'gpt-4o';

    const config = loadConfig();

    expect(config.apiKey).toBe('openai-key');
    expect(config.baseUrl).toBe('https://openai.com/v1');
    expect(config.model).toBe('gpt-4o');
  });

  it('should load resize config from environment variables', () => {
    process.env.VISION_API_KEY = 'test-key';
    process.env.VISION_RESIZE = '1920x1080';

    const config = loadConfig();

    expect(config.resize).toBeDefined();
    expect(config.resize?.width).toBe(1920);
    expect(config.resize?.height).toBe(1080);
  });

  it('should load resize config with different dimensions', () => {
    process.env.VISION_API_KEY = 'test-key';
    process.env.VISION_RESIZE = '800x600';

    const config = loadConfig();

    expect(config.resize).toBeDefined();
    expect(config.resize?.width).toBe(800);
    expect(config.resize?.height).toBe(600);
  });

  it('should not include resize when VISION_RESIZE is not set', () => {
    process.env.VISION_API_KEY = 'test-key';

    const config = loadConfig();

    expect(config.resize).toBeUndefined();
  });

  it('should not include resize when VISION_RESIZE has invalid format', () => {
    process.env.VISION_API_KEY = 'test-key';
    process.env.VISION_RESIZE = 'invalid';

    const config = loadConfig();

    expect(config.resize).toBeUndefined();
  });
});