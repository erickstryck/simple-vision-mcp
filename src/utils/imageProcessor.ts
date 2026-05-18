import { readFileSync } from 'fs';
import { extname, basename } from 'path';

export interface ImageData {
  base64: string;
  mimeType: string;
  filename: string;
}

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
};

export function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export function isValidImageFormat(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ext in MIME_TYPES;
}

export function imagePathToData(filePath: string): ImageData {
  if (!isValidImageFormat(filePath)) {
    throw new Error(`Unsupported image format: ${extname(filePath)}`);
  }

  const imageBuffer = readFileSync(filePath);
  const base64 = imageBuffer.toString('base64');
  const mimeType = getMimeType(filePath);
  const filename = basename(filePath);

  return { base64, mimeType, filename };
}

export function imageDataToDataUrl(imageData: ImageData): string {
  return `data:${imageData.mimeType};base64,${imageData.base64}`;
}