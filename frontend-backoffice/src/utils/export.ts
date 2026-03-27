/**
 * Export utilities — trigger file downloads from Blob responses.
 */

/**
 * Triggers a browser download from a Blob.
 * Creates a temporary anchor element, clicks it, then removes it.
 *
 * @param blob     - The file content
 * @param filename - Suggested filename including extension
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke after a short delay to ensure the download has started
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generates a timestamped export filename.
 * Example: "orders-export-2024-03-15.csv"
 */
export function buildExportFilename(
  prefix: string,
  format: 'csv' | 'json'
): string {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}-${date}.${format}`;
}