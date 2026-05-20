import sharp from 'sharp';

export interface ResizeOptions {
  width?: number;
  height?: number;
}

export interface ImageResizer {
  resize(buffer: Buffer, options: ResizeOptions): Promise<Buffer>;
}

export class SharpImageResizer implements ImageResizer {
  async resize(buffer: Buffer, options: ResizeOptions): Promise<Buffer> {
    let pipeline = sharp(buffer);

    if (options.width || options.height) {
      pipeline = pipeline.resize(options.width, options.height, {
        fit: 'fill',
      });
    }

    return pipeline.toBuffer();
  }
}

export const imageResizer: ImageResizer = new SharpImageResizer();