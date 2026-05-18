import { describe, it, expect, beforeEach } from 'vitest';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { imagePathToData, imageDataToDataUrl, getMimeType, isValidImageFormat } from '../src/utils/imageProcessor.js';

describe('ImageProcessor', () => {
  const testDir = '/tmp/simple-vision-mcp-tests';

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
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
    it('should convert png file to base64 data', () => {
      const testFile = join(testDir, 'test.png');
      const pngData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      writeFileSync(testFile, pngData);

      const result = imagePathToData(testFile);

      expect(result.mimeType).toBe('image/png');
      expect(result.base64).toBe(pngData.toString('base64'));
      expect(result.filename).toBe('test.png');

      unlinkSync(testFile);
    });

    it('should throw error for unsupported format', () => {
      const testFile = join(testDir, 'test.pdf');
      writeFileSync(testFile, Buffer.from('test'));

      expect(() => imagePathToData(testFile)).toThrow('Unsupported image format: .pdf');

      unlinkSync(testFile);
    });

    it('should throw error for non-existent file', () => {
      expect(() => imagePathToData('/non/existent/file.png')).toThrow();
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