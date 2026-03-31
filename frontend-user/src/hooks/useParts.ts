import { useState, useCallback, useMemo } from "react";
import { getParts } from "../services/partService";
import usePaginatedFetch, { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "./usePaginatedFetch";
import type { PartResponse, PartQueryParams } from "../types/part.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PartFilters = Record<string, unknown>;

export interface UsePartsReturn {
  parts: PartResponse[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setFilters: (filters: PartFilters) => void;
  nextPage: () => void;
  prevPage: () => void;
  refetch: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const useParts = (initialFilters: PartFilters = {}): UsePartsReturn => {
  const [filters, setFiltersState] = useState<PartFilters>(initialFilters);
  const [page, setPage]            = useState(DEFAULT_PAGE);

  // Memoized params — new reference only when filters or page change
  const params = useMemo<PartQueryParams>(
    () => ({ ...filters, page, size: DEFAULT_PAGE_SIZE }),
    [filters, page]
  );

  const { data, loading, error, totalPages, hasNextPage, hasPrevPage, nextPage, prevPage, refetch } =
    usePaginatedFetch<PartResponse, PartQueryParams>(
      getParts,
      params,
      "Failed to fetch parts."
    );

  // Reset to page 0 on filter change — skip update if already there
  const setFilters = useCallback((newFilters: PartFilters) => {
    setPage((prev) => (prev
         === DEFAULT_PAGE ? prev : DEFAULT_PAGE));
    setFiltersState(newFilters);
  }, []);

  return useMemo(
    () => ({
      parts: data,
      loading,
      error,
      page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      setFilters,
      nextPage,
      prevPage,
      refetch,
    }),
    [data, loading, error, page, totalPages, hasNextPage, hasPrevPage, setFilters, nextPage, prevPage, refetch]
  );
};

export default useParts;