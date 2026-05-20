import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VisionService } from '../src/services/visionService.js';
import { ServerConfig } from '../src/config/index.js';

describe('VisionService', () => {
  const mockConfig: ServerConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.test.com/v1',
    model: 'test-model',
    maxTokens: 4096,
    timeout: 120,
  };

  let visionService: VisionService;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    visionService = new VisionService(mockConfig);
  });

  it('should analyze image successfully', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Test description' } }],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await visionService.analyze({
      imageDataUrl: 'data:image/png;base64,test',
      prompt: 'Describe this image',
      maxTokens: 4096,
    });

    expect(result.content).toBe('Test description');
    expect(result.usage?.totalTokens).toBe(150);
  });

  it('should throw error on API failure', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await expect(
      visionService.analyze({
        imageDataUrl: 'data:image/png;base64,test',
        prompt: 'Describe this image',
        maxTokens: 4096,
      })
    ).rejects.toThrow('Vision API error: 401 - Unauthorized');
  });

  it('should handle empty response', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '' } }],
      }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await visionService.analyze({
      imageDataUrl: 'data:image/png;base64,test',
      prompt: 'Describe this image',
      maxTokens: 4096,
    });

    expect(result.content).toBe('');
  });

  describe('getResizeConfig', () => {
    it('should return undefined when no resize config is set', () => {
      const service = new VisionService(mockConfig);
      expect(service.getResizeConfig()).toBeUndefined();
    });

    it('should return resize config when set', () => {
      const configWithResize: ServerConfig = {
        ...mockConfig,
        resize: { width: 1280, height: 720 },
      };
      const service = new VisionService(configWithResize);
      expect(service.getResizeConfig()).toEqual({ width: 1280, height: 720 });
    });

    it('should return resize config with only width', () => {
      const configWithResize: ServerConfig = {
        ...mockConfig,
        resize: { width: 1024 },
      };
      const service = new VisionService(configWithResize);
      expect(service.getResizeConfig()).toEqual({ width: 1024 });
    });

    it('should return resize config with only height', () => {
      const configWithResize: ServerConfig = {
        ...mockConfig,
        resize: { height: 768 },
      };
      const service = new VisionService(configWithResize);
      expect(service.getResizeConfig()).toEqual({ height: 768 });
    });
  });
});