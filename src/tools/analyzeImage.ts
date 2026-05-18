import { VisionService } from '../services/visionService.js';
import { imagePathToData, imageDataToDataUrl } from '../utils/imageProcessor.js';

export interface AnalyzeImageParams {
  image_path: string;
  prompt?: string;
}

export function createAnalyzeImageTool(visionService: VisionService) {
  return {
    name: 'analyze_image',
    description: 'Analyzes an image and returns a detailed description. Supports PNG, JPEG, GIF, WebP, and BMP formats.',
    inputSchema: {
      type: 'object',
      properties: {
        image_path: {
          type: 'string',
          description: 'Path to the image file to analyze',
        },
        prompt: {
          type: 'string',
          description: 'Custom prompt for image analysis',
          default: 'Describe this image in detail, including objects, text, colors, composition, and any notable features.',
        },
      },
      required: ['image_path'],
    },
    handler: async (params: AnalyzeImageParams) => {
      const { image_path, prompt } = params;

      const imageData = imagePathToData(image_path);
      const imageDataUrl = imageDataToDataUrl(imageData);

      const result = await visionService.analyze({
        imageDataUrl,
        prompt: prompt || 'Describe this image in detail, including objects, text, colors, composition, and any notable features.',
        maxTokens: 4096,
      });

      return {
        content: [{ type: 'text', text: result.content }],
      };
    },
  };
}