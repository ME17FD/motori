/**
 * Converts an internal Minio URL (motori-minio:9000) to the public URL
 * accessible from the browser (localhost:9002).
 *
 * Minio stores files with the internal Docker hostname but the browser
 * needs the publicly mapped port to load images.
 */
export function toPublicMinioUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  return url
    .replace('http://motori-minio:9000', 'http://localhost:9002')
    .replace('https://motori-minio:9000', 'http://localhost:9002');
}

/**
 * Checks if a URL is an internal Minio URL that needs to be converted.
 */
export function isMinioUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes('motori-minio');
}