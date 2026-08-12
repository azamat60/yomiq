const MAX_SIDE = 1024;
const QUALITY = 0.82;

export type PreparedImage = {
  /** Sent to the API. */
  dataUrl: string;
  /** Stored with the entry. */
  blob: Blob;
};

/**
 * Phone photos are 3–8 MB, well past Vercel's 4.5 MB body limit once base64
 * inflates them by a third. Downscaling here also cuts vision-token cost.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  // `from-image` applies the EXIF rotation, otherwise portrait shots arrive sideways.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not process the photo.');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY),
  );
  if (!blob) throw new Error('Could not compress the photo.');

  return { dataUrl: canvas.toDataURL('image/jpeg', QUALITY), blob };
}
