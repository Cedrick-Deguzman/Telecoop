// Client-side image compression for mobile uploads.
// Downscales to a max edge and re-encodes as JPEG before the file leaves the device,
// cutting upload bandwidth. Cloudinary applies a second `quality:auto` pass server-side.

const MAX_EDGE = 1600;   // px — longest side after downscale
const QUALITY = 0.7;     // JPEG quality
const SKIP_BELOW = 300 * 1024; // bytes — tiny files aren't worth re-encoding

export async function compressImage(file: File): Promise<File> {
  // Only handle raster images; leave anything else (or already-small files) untouched.
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.size < SKIP_BELOW) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    );
    if (!blob || blob.size >= file.size) return file; // no win — keep original

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg', lastModified: file.lastModified });
  } catch {
    // Any decode/encode failure: fall back to the original file rather than blocking the upload.
    return file;
  }
}
