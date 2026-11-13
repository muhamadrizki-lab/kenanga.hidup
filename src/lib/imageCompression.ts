export interface CompressedImageResult {
  dataUrl: string;
  sizeKB: number;
}

/**
 * Compresses an image file in the browser using Canvas API so it fits compactly
 * inside Google Sheets cells (chunked <= 40,000 chars per cell) while keeping crisp quality.
 */
export async function compressImageForSpreadsheet(
  file: File,
  maxDimension = 960,
  targetMaxChars = 75000
): Promise<CompressedImageResult> {
  const imageBitmap = await loadImageElement(file);
  const { width, height } = fitDimensions(
    imageBitmap.width,
    imageBitmap.height,
    maxDimension
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser tidak mendukung pemrosesan gambar Canvas.');
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  // Try WebP first (smallest size), fallback to JPEG if WebP unsupported
  const mimeType = supportsWebP(canvas) ? 'image/webp' : 'image/jpeg';
  let quality = 0.78;
  let dataUrl = canvas.toDataURL(mimeType, quality);

  while (dataUrl.length > targetMaxChars && quality > 0.32) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL(mimeType, quality);
  }

  // If still large (e.g. high-detail photo), scale down dimension once more
  if (dataUrl.length > targetMaxChars * 1.4) {
    const smaller = fitDimensions(width, height, 640);
    canvas.width = smaller.width;
    canvas.height = smaller.height;
    ctx.drawImage(imageBitmap, 0, 0, smaller.width, smaller.height);
    dataUrl = canvas.toDataURL(mimeType, 0.62);
  }

  const sizeKB = Math.max(1, Math.round((dataUrl.length * 0.75) / 1024));
  return { dataUrl, sizeKB };
}

function fitDimensions(w: number, h: number, maxDim: number) {
  if (w <= maxDim && h <= maxDim) return { width: w, height: h };
  const ratio = Math.min(maxDim / w, maxDim / h);
  return {
    width: Math.max(1, Math.round(w * ratio)),
    height: Math.max(1, Math.round(h * ratio)),
  };
}

function supportsWebP(canvas: HTMLCanvasElement): boolean {
  try {
    return canvas.toDataURL('image/webp', 0.5).startsWith('data:image/webp');
  } catch {
    return false;
  }
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Gagal membaca file ${file.name}.`));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error(`File ${file.name} bukan gambar yang valid.`));
      img.onload = () => resolve(img);
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
