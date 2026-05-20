import { describe, it, expect, beforeEach } from 'vitest';
import sharp from 'sharp';
import { SharpImageResizer, ImageResizer, ResizeOptions } from '../src/utils/imageResizer.js';

describe('ImageResizer', () => {
  describe('SharpImageResizer', () => {
    let resizer: ImageResizer;
    let validPngBuffer: Buffer;

    beforeEach(async () => {
      resizer = new SharpImageResizer();
      validPngBuffer = await sharp({
        create: {
          width: 200,
          height: 200,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      }).png().toBuffer();
    });

    it('should resize image with both width and height', async () => {
      const options: ResizeOptions = { width: 100, height: 100 };

      const result = await resizer.resize(validPngBuffer, options);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should resize image with only width', async () => {
      const options: ResizeOptions = { width: 50 };

      const result = await resizer.resize(validPngBuffer, options);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should resize image with only height', async () => {
      const options: ResizeOptions = { height: 75 };

      const result = await resizer.resize(validPngBuffer, options);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return original buffer when no resize options provided', async () => {
      const options: ResizeOptions = {};

      const result = await resizer.resize(validPngBuffer, options);

      expect(result).toBeInstanceOf(Buffer);
    });
  });
});