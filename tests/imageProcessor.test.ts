import { describe, it, expect, beforeEach } from 'vitest';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { imagePathToData, imageDataToDataUrl, getMimeType, isValidImageFormat } from '../src/utils/imageProcessor.js';
import { SharpImageResizer, ResizeOptions } from '../src/utils/imageResizer.js';

describe('ImageProcessor', () => {
  const testDir = '/tmp/simple-vision-mcp-tests';
  const resizer = new SharpImageResizer();
  let validPngBuffer: Buffer;

  beforeEach(async () => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
    validPngBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    }).png().toBuffer();
  });

  describe('getMimeType', () => {
    it('should return correct mime type for png', () => {
      expect(getMimeType('/path/to/image.png')).toBe('image/png');
    });

    it('should return correct mime type for jpeg', () => {
      expect(getMimeType('/path/to/image.jpg')).toBe('image/jpeg');
      expect(getMimeType('/path/to/image.jpeg')).toBe('image/jpeg');
    });

    it('should return correct mime type for webp', () => {
      expect(getMimeType('/path/to/image.webp')).toBe('image/webp');
    });

    it('should return correct mime type for gif', () => {
      expect(getMimeType('/path/to/image.gif')).toBe('image/gif');
    });

    it('should return octet-stream for unknown formats', () => {
      expect(getMimeType('/path/to/image.xyz')).toBe('application/octet-stream');
    });
  });

  describe('isValidImageFormat', () => {
    it('should return true for supported formats', () => {
      expect(isValidImageFormat('image.png')).toBe(true);
      expect(isValidImageFormat('image.jpg')).toBe(true);
      expect(isValidImageFormat('image.jpeg')).toBe(true);
      expect(isValidImageFormat('image.webp')).toBe(true);
      expect(isValidImageFormat('image.gif')).toBe(true);
      expect(isValidImageFormat('image.bmp')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(isValidImageFormat('image.pdf')).toBe(false);
      expect(isValidImageFormat('image.txt')).toBe(false);
      expect(isValidImageFormat('image.svg')).toBe(false);
    });
  });

  describe('imagePathToData', () => {
    it('should convert png file to base64 data', async () => {
      const testFile = join(testDir, 'test.png');
      writeFileSync(testFile, validPngBuffer);

      const result = await imagePathToData(testFile);

      expect(result.mimeType).toBe('image/png');
      expect(result.base64).toBe(validPngBuffer.toString('base64'));
      expect(result.filename).toBe('test.png');

      unlinkSync(testFile);
    });

    it('should throw error for unsupported format', async () => {
      const testFile = join(testDir, 'test.pdf');
      writeFileSync(testFile, Buffer.from('test'));

      await expect(imagePathToData(testFile)).rejects.toThrow('Unsupported image format: .pdf');

      unlinkSync(testFile);
    });

    it('should throw error for non-existent file', async () => {
      await expect(imagePathToData('/non/existent/file.png')).rejects.toThrow();
    });

    it('should resize image when resize options are provided', async () => {
      const testFile = join(testDir, 'test.png');
      writeFileSync(testFile, validPngBuffer);

      const resizeOptions: ResizeOptions = { width: 100, height: 100 };
      const result = await imagePathToData(testFile, resizeOptions, resizer);

      expect(result.mimeType).toBe('image/png');
      expect(result.filename).toBe('test.png');
      expect(result.base64.length).toBeGreaterThan(0);

      unlinkSync(testFile);
    });

    it('should not resize when no resize options provided', async () => {
      const testFile = join(testDir, 'test.png');
      writeFileSync(testFile, validPngBuffer);

      const result = await imagePathToData(testFile, undefined, resizer);

      expect(result.base64).toBe(validPngBuffer.toString('base64'));

      unlinkSync(testFile);
    });
  });

  describe('imageDataToDataUrl', () => {
    it('should convert image data to data URL', () => {
      const imageData = {
        base64: 'testbase64',
        mimeType: 'image/png',
        filename: 'test.png',
      };

      const result = imageDataToDataUrl(imageData);

      expect(result).toBe('data:image/png;base64,testbase64');
    });
  });
});