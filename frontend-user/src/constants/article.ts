import type {
  ArticleFilters,
  ArticleSortOption,
  PaginationState,
} from "../types/article";

// ─────────────────────────────────────────────
// Default state
// ─────────────────────────────────────────────

/** Initial filter values — no filter active */
export const DEFAULT_ARTICLE_FILTERS: ArticleFilters = {
  search:   "",
  category: "",
  brand:    "",
  status:   "all",
  sortBy:   "newest",
};

/** Initial pagination state */
export const DEFAULT_PAGINATION: Omit<PaginationState, "totalItems" | "totalPages"> = {
  currentPage: 1,
  pageSize:    12,
};

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

export const PAGE_SIZE_OPTIONS = [6, 12, 24] as const;

// ─────────────────────────────────────────────
// Sort options
// ─────────────────────────────────────────────

export const SORT_OPTIONS: Array<{ value: ArticleSortOption; label: string }> = [
  { value: "newest",     label: "Les plus récents"  },
  { value: "price_asc",  label: "Prix croissant"    },
  { value: "price_desc", label: "Prix décroissant"  },
  { value: "name_asc",   label: "Nom (A → Z)"       },
];

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export const ARTICLE_CATEGORIES: string[] = [
  "Casques",
  "Équipements",
  "Consommables",
  "Pièces détachées",
  "Accessoires",
];

// ─────────────────────────────────────────────
// Brands
// ─────────────────────────────────────────────

export const ARTICLE_BRANDS: string[] = [
  "Kawasaki",
  "Yamaha",
  "Suzuki",
  "Honda",
  "KTM",
];

// ─────────────────────────────────────────────
// Status display map
// ─────────────────────────────────────────────

import type { ArticleStatus } from "../types/article";

export const STATUS_LABELS: Record<ArticleStatus, string> = {
  in_stock:     "En stock",
  low_stock:    "Stock limité",
  out_of_stock: "Rupture de stock",
};

export const STATUS_COLORS: Record<ArticleStatus, string> = {
  in_stock:     "#2e7d32",  // green
  low_stock:    "#e65100",  // orange
  out_of_stock: "#c1121f",  // red — matches --color-red
};

export const STATUS_BG: Record<ArticleStatus, string> = {
  in_stock:     "#e8f5e9",
  low_stock:    "#fff3e0",
  out_of_stock: "#fdecea",
};
