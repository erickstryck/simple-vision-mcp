import { readFile, access } from 'fs/promises';
import { extname, basename } from 'path';
import { constants } from 'fs';
import { ImageResizer, ResizeOptions } from './imageResizer.js';

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

export async function imagePathToData(filePath: string, resizeOptions?: ResizeOptions, imageResizer?: ImageResizer): Promise<ImageData> {
  if (!isValidImageFormat(filePath)) {
    throw new Error(`Unsupported image format: ${extname(filePath)}`);
  }

  try {
    await access(filePath, constants.R_OK);
  } catch {
    throw new Error(`File not found or not readable: ${filePath}`);
  }

  let imageBuffer: Buffer = await readFile(filePath);

  if (resizeOptions && imageResizer && (resizeOptions.width || resizeOptions.height)) {
    imageBuffer = await imageResizer.resize(imageBuffer, resizeOptions);
  }

  const base64 = imageBuffer.toString('base64');
  const mimeType = getMimeType(filePath);
  const filename = basename(filePath);

  return { base64, mimeType, filename };
}

export function imageDataToDataUrl(imageData: ImageData): string {
  return `data:${imageData.mimeType};base64,${imageData.base64}`;
}