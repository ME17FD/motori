/**
 * Formats a number as a currency string (MAD by default).
 */
export function formatCurrency(
  value: number,
  currency = 'MAD',
  locale = 'fr-MA',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats an ISO datetime string to a readable locale date.
 */
export function formatDate(iso: string, locale = 'fr-MA'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

/**
 * Formats an ISO datetime string to date + time.
 */
export function formatDateTime(iso: string, locale = 'fr-MA'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/**
 * Returns a short relative label like "2h ago" or "3d ago".
 */
export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}