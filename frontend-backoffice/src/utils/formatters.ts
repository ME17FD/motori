/**
 * Shared formatters for dates, currency, and order data.
 */

/** Format ISO datetime to readable short format: "Mar 15, 2024" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format ISO datetime including time: "Mar 15, 2024, 14:32" */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format number as MAD currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Truncate a UUID to a readable short form: "A1B2C3D4" */
export function shortId(uuid: string): string {
  return uuid.slice(0, 8).toUpperCase();
}