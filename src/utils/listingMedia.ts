/** Listing videos share the `images` array with photos; Cloudinary keeps the file extension. */
const VIDEO_URL = /\.(mp4|mov|webm|m4v|3gp)(\?.*)?$/i;

export function isVideoUrl(url: string | undefined | null): boolean {
  return VIDEO_URL.test(url || '');
}
