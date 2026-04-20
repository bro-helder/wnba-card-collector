import imageCompression from 'browser-image-compression';

export interface ProcessedImage {
  file: File;
  previewUrl: string;
}

export async function processCardImage(file: File): Promise<ProcessedImage> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1400,
    useWebWorker: true,
    initialQuality: 0.85,
  });
  return { file: compressed, previewUrl: URL.createObjectURL(compressed) };
}
