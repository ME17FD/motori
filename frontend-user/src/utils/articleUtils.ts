import type { Article, ArticleStatus, ArticleQueryParams } from "../types/article";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_BG,
} from "../constants/article";

// ─────────────────────────────────────────────
// Price formatting
// ─────────────────────────────────────────────

/**
 * Formats a numeric price into a human-readable MAD string.
 * @example formatPrice(1500) → "1 500,00 DH"
 */
export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("fr-MA", {
    style:                 "currency",
    currency:              "MAD",
    currencyDisplay:       "symbol",
    minimumFractionDigits: 2,
  }).format(price);

// ─────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────

/** Returns the display label for a given ArticleStatus */
export const getStatusLabel = (status: ArticleStatus): string =>
  STATUS_LABELS[status];

/** Returns the text color hex for a given ArticleStatus */
export const getStatusColor = (status: ArticleStatus): string =>
  STATUS_COLORS[status];

/** Returns the background color hex for a given ArticleStatus */
export const getStatusBg = (status: ArticleStatus): string =>
  STATUS_BG[status];

/**
 * Returns an inline style object for a status badge.
 * @example
 * <span style={getStatusBadgeStyle("in_stock")}>En stock</span>
 */
export const getStatusBadgeStyle = (
  status: ArticleStatus
): React.CSSProperties => ({
  color:           getStatusColor(status),
  backgroundColor: getStatusBg(status),
});

// ─────────────────────────────────────────────
// Article helpers
// ─────────────────────────────────────────────

/**
 * Returns true if the article can be added to the cart
 * (i.e. it is not out of stock).
 */
export const isOrderable = (article: Article): boolean =>
  article.status !== "out_of_stock";

/**
 * Returns a fallback image path when an article has no imageUrl
 * or the image fails to load.
 */
export const getFallbackImage = (): string =>
  "/assets/images/placeholder-product.jpg";

/**
 * Formats a raw ISO date string into a readable French locale date.
 * @example formatDate("2025-11-01T10:00:00Z") → "1 nov. 2025"
 */
export const formatDate = (isoString: string): string =>
  new Intl.DateTimeFormat("fr-MA", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  }).format(new Date(isoString));

// ─────────────────────────────────────────────
// Query params builder
// ─────────────────────────────────────────────

/**
 * Converts an ArticleQueryParams object into a URLSearchParams instance,
 * stripping any undefined or empty-string values.
 * Useful for constructing API request URLs manually.
 */
export const buildArticleQueryParams = (
  params: ArticleQueryParams
): URLSearchParams => {
  const query = new URLSearchParams();

  (
    Object.entries(params) as Array<[keyof ArticleQueryParams, string | number | undefined]>
  ).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query;
};

// ─────────────────────────────────────────────
// Pagination helpers
// ─────────────────────────────────────────────

/**
 * Generates the array of page numbers to display in a pagination bar.
 * Always includes first, last, current, and neighbours.
 * Uses -1 as a sentinel value for ellipsis gaps.
 *
 * @example
 * getPageRange(5, 10) → [1, -1, 4, 5, 6, -1, 10]
 */
export const getPageRange = (
  currentPage: number,
  totalPages: number
): number[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: number[] = [1];

  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd   = Math.min(totalPages - 1, currentPage + 1);

  if (rangeStart > 2)           pages.push(-1);             // left ellipsis

  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

  if (rangeEnd < totalPages - 1) pages.push(-1);            // right ellipsis

  pages.push(totalPages);

  return pages;
};