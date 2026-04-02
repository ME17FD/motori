import { useState, useCallback, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getEquipements } from "../services/equipementService";
import { queryKeys } from "../api/queryKeys";
import parseError from "../utils/parseError";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "../constants/pagination.constants";
import type {
  EquipementResponse,
  EquipementQueryParams,
  EquipementFilterParams,
} from "../types/equipement.types";

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

/**
 * Equipment list with client-side filters + pagination, backed by React Query.
 */
const useEquipements = (initialFilters: EquipementFilters = {}): UseEquipementsReturn => {
  const [filters, setFiltersState] = useState<EquipementFilters>(initialFilters);
  const [page, setPage] = useState(DEFAULT_PAGE);

  const params = useMemo<EquipementQueryParams>(
    () => ({ ...filters, page, pageSize: DEFAULT_PAGE_SIZE }),
    [filters, page]
  );

  const q = useQuery({
    queryKey: queryKeys.equipements.list(params),
    queryFn: () => getEquipements(params),
    placeholderData: keepPreviousData,
  });

  const totalPages = q.data?.page.totalPages ?? 0;

  const setFilters = useCallback((newFilters: EquipementFilters) => {
    setPage((prev) => (prev === DEFAULT_PAGE ? prev : DEFAULT_PAGE));
    setFiltersState(newFilters);
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => (prev >= totalPages - 1 ? prev : prev + 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => (prev <= 0 ? prev : prev - 1));
  }, []);

  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return useMemo(
    () => ({
      equipements: q.data?.content ?? [],
      loading: q.isPending && !q.isPlaceholderData,
      error: q.isError ? parseError(q.error) : null,
      page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      setFilters,
      nextPage,
      prevPage,
      refetch: q.refetch,
    }),
    [
      q.data,
      q.isPending,
      q.isPlaceholderData,
      q.isError,
      q.error,
      q.refetch,
      page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      setFilters,
      nextPage,
      prevPage,
    ]
  );
};

export default useEquipements;
