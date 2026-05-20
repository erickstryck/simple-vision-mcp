export interface ResizeConfig {
  width?: number;
  height?: number;
}

export interface ServerConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  timeout: number;
  resize?: ResizeConfig;
}

export function loadConfig(): ServerConfig {
  const apiKey = process.env.VISION_API_KEY || process.env.OPENAI_API_KEY || '';
  const baseUrl = process.env.VISION_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.VISION_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const maxTokens = parseInt(process.env.VISION_MAX_TOKENS || '4096', 10);
  const timeout = parseInt(process.env.VISION_TIMEOUT || '120', 10);

  const resize: ResizeConfig | undefined = (() => {
    const resizeStr = process.env.VISION_RESIZE;
    if (!resizeStr) return undefined;
    const match = resizeStr.match(/^(\d+)x(\d+)$/);
    if (!match) return undefined;
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  })();

  if (!apiKey) {
    throw new Error('VISION_API_KEY or OPENAI_API_KEY environment variable is required');
  }

  return { apiKey, baseUrl, model, maxTokens, timeout, resize };
}