import { useState, useEffect, useCallback } from "react";
import type {
  Article,
  ArticleFilters,
  ArticleQueryParams,
  ArticleSortKey,
  PaginationState,
  SortDirection,
} from "../types/article";
import {
  DEFAULT_ARTICLE_FILTERS,
  DEFAULT_PAGINATION,
} from "../constants/article";
import { fetchArticles } from "../services/articleService";

// ─────────────────────────────────────────────
// Return type
// ─────────────────────────────────────────────

interface UseArticlesReturn {
  /** Current page of articles */
  articles: Article[];
  /** Whether the request is in-flight */
  loading: boolean;
  /** Error message if the request failed */
  error: string | null;
  /** Current pagination state */
  pagination: PaginationState;
  /** Current active filters */
  filters: ArticleFilters;
  /** Update one or more filters and reset to page 1 */
  setFilters: (partial: Partial<ArticleFilters>) => void;
  /** Reset all filters to their default values */
  resetFilters: () => void;
  /** Navigate to a specific page */
  setPage: (page: number) => void;
  /** Change the number of items per page */
  setPageSize: (size: number) => void;
}

// ─────────────────────────────────────────────
// Sort resolver
// Converts an ArticleSortOption string into
// the key + direction the API expects.
// ─────────────────────────────────────────────

const resolveSortParams = (
  sortBy: ArticleFilters["sortBy"]
): { sortKey: ArticleSortKey; sortDirection: SortDirection } => {
  switch (sortBy) {
    case "price_asc":
      return { sortKey: "price", sortDirection: "asc" };
    case "price_desc":
      return { sortKey: "price", sortDirection: "desc" };
    case "name_asc":
      return { sortKey: "name", sortDirection: "asc" };
    case "newest":
    default:
      return { sortKey: "createdAt", sortDirection: "desc" };
  }
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export const useArticles = (): UseArticlesReturn => {
  const [articles, setArticles]   = useState<Article[]>([]);
  const [loading, setLoading]     = useState<boolean>(false);
  const [error, setError]         = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ArticleFilters>(DEFAULT_ARTICLE_FILTERS);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: DEFAULT_PAGINATION.currentPage,
    pageSize:    DEFAULT_PAGINATION.pageSize,
    totalItems:  0,
    totalPages:  0,
  });

  // ── Fetch ──────────────────────────────────

  const loadArticles = useCallback(async (
    activeFilters: ArticleFilters,
    page: number,
    pageSize: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { sortKey, sortDirection } = resolveSortParams(activeFilters.sortBy);

      const params: ArticleQueryParams = {
        page,
        pageSize,
        ...(activeFilters.search   && { search:        activeFilters.search }),
        ...(activeFilters.category && { category:      activeFilters.category }),
        ...(activeFilters.brand    && { brand:         activeFilters.brand }),
        ...(activeFilters.status !== "all" && { status: activeFilters.status }),
        sortBy:        sortKey,
        sortDirection: sortDirection,
      };

      const response = await fetchArticles(params);

      setArticles(response.data);
      setPagination((prev) => ({
        ...prev,
        currentPage: response.page,
        pageSize:    response.pageSize,
        totalItems:  response.total,
        totalPages:  Math.ceil(response.total / response.pageSize),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Effects ────────────────────────────────

  useEffect(() => {
    void loadArticles(filters, pagination.currentPage, pagination.pageSize);
  }, [filters, pagination.currentPage, pagination.pageSize, loadArticles]);

  // ── Public handlers ────────────────────────

  /** Update one or more filter fields and reset to page 1 */
  const setFilters = useCallback((partial: Partial<ArticleFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  /** Reset all filters to defaults and go back to page 1 */
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_ARTICLE_FILTERS);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  /** Navigate to a specific page number */
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  /** Change the number of items per page and reset to page 1 */
  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }));
  }, []);

  return {
    articles,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
  };
};