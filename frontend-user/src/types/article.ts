// ─────────────────────────────────────────────
// Article domain types — client-facing product page
// ─────────────────────────────────────────────

/** Stock availability status of a product */
export type ArticleStatus = "in_stock" | "low_stock" | "out_of_stock";

/** Sort direction */
export type SortDirection = "asc" | "desc";

/** Available keys to sort articles by */
export type ArticleSortKey = "name" | "price" | "createdAt";

/** Available sort options exposed in the UI */
export type ArticleSortOption =
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "newest";

// ─────────────────────────────────────────────
// Core entity
// ─────────────────────────────────────────────

/** A single article/product as returned by the API */
export interface Article {
  id: string;
  name: string;
  description: string;
  price: number;          // in MAD (Moroccan Dirham)
  imageUrl: string;
  category: string;
  brand: string;
  status: ArticleStatus;
  stock: number;
  createdAt: string;      // ISO date string
}

// ─────────────────────────────────────────────
// Filtering
// ─────────────────────────────────────────────

/** Active filters applied on the articles page */
export interface ArticleFilters {
  search: string;
  category: string;       // empty string = all
  brand: string;          // empty string = all
  status: ArticleStatus | "all";
  sortBy: ArticleSortOption;
}

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

/** Pagination state */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────

/** A single entry in the shopping cart */
export interface CartItem {
  article: Article;
  quantity: number;
}

/** Full cart state */
export interface CartState {
  items: CartItem[];
  totalCount: number;     // sum of all quantities
  totalPrice: number;     // sum of (price * quantity)
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────

/** Shape of the paginated API response */
export interface ArticleListResponse {
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
}

/** Query params sent to the articles endpoint */
export interface ArticleQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: ArticleStatus;
  sortBy?: ArticleSortKey;
  sortDirection?: SortDirection;
}