import { useState, useCallback, useMemo } from "react";
import { getEquipements } from "../services/equipementService";
import usePaginatedFetch, {DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "./usePaginatedFetch";
import type {
  EquipementResponse,
  EquipementQueryParams,
  EquipementFilterParams,
} from "../types/equipement.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EquipementFilters = EquipementFilterParams;

export interface UseEquipementsReturn {
  equipements: EquipementResponse[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setFilters: (filters: EquipementFilters) => void;
  nextPage: () => void;
  prevPage: () => void;
  refetch: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const useEquipements = (
  initialFilters: EquipementFilters = {}
): UseEquipementsReturn => {
  const [filters, setFiltersState] = useState<EquipementFilters>(initialFilters);
  const [page, setPage]            = useState(DEFAULT_PAGE);

  // Memoized params — new reference only when filters or page change
  const params = useMemo<EquipementQueryParams>(
    () => ({ ...filters, page, pageSize: DEFAULT_PAGE_SIZE }),
    [filters, page]
  );

  const { data, loading, error, totalPages, hasNextPage, hasPrevPage, nextPage, prevPage, refetch } =
    usePaginatedFetch<EquipementResponse, EquipementQueryParams>(
      getEquipements,
      params,
      "Failed to fetch equipements."
    );

  // Reset to page 0 on filter change — skip update if already there
  const setFilters = useCallback((newFilters: EquipementFilters) => {
    setPage((prev) => (prev === DEFAULT_PAGE ? prev : DEFAULT_PAGE));
    setFiltersState(newFilters);
  }, []);

  return useMemo(
    () => ({
      equipements: data,
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

export default useEquipements;