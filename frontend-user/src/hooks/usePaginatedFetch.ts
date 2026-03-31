import { useState, useEffect, useCallback, useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaginationState {
  page: number;
  totalPages: number;
}

interface FetchState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export interface UsePaginatedFetchReturn<T> {
  // Data
  data: T[];
  loading: boolean;
  error: string | null;
  // Pagination
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  // Actions
  nextPage: () => void;
  prevPage: () => void;
  refetch: () => void;
}

export interface PagedResponse<T> {
  content: T[];
  // Backend pagination metadata is not always present at runtime.
  // We treat it as optional and keep the existing totalPages value if missing.
  page?: { totalPages: number };
  // Some backends may return totalPages at the root.
  totalPages?: number;
}

// Fetch function signature any paginated service function must satisfy
export type FetchFn<TData, TParams> = (params: TParams) => Promise<PagedResponse<TData>>;

// ── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_PAGE      = 0;
export const DEFAULT_PAGE_SIZE = 20;

const LOADING_PATCH = { loading: true, error: null } as const;

const buildInitialFetchState = <T>(): FetchState<T> => ({
  data: [],
  loading: false,
  error: null,
});

// ── Hook ──────────────────────────────────────────────────────────────────────

const usePaginatedFetch = <TData, TParams>(
  fetchFn: FetchFn<TData, TParams>,
  params: TParams,
  errorMessage: string
): UsePaginatedFetchReturn<TData> => {
  const [fetchState, setFetchState] = useState<FetchState<TData>>(
    buildInitialFetchState<TData>
  );
  const [pagination, setPagination] = useState<PaginationState>({
    page: DEFAULT_PAGE,
    totalPages: 0,
  });

  const fetch = useCallback(async (fetchParams: TParams) => {
    setFetchState((prev) => ({ ...prev, ...LOADING_PATCH }));

    try {
      const response = await fetchFn(fetchParams);

      const safeContent = Array.isArray(response.content) ? response.content : [];

      setFetchState({
        data: safeContent,
        loading: false,
        error: null,
      });

      // Bail out if totalPages unchanged — avoids redundant re-render
      setPagination((prev) => {
        const incoming = response.page?.totalPages ?? response.totalPages;
        if (typeof incoming !== "number") return prev;
        return prev.totalPages === incoming
          ? prev
          : { ...prev, totalPages: incoming };
      });
    } catch (err) {
      setFetchState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : errorMessage,
      }));
    }
  }, [fetchFn, errorMessage]);

  // Trigger only when memoized params reference changes
  useEffect(() => {
    fetch(params);
  }, [params, fetch]);

  // ── Pagination actions ────────────────────────────────────────────────────

  const nextPage = useCallback(() => {
    setPagination((prev) =>
      prev.page >= prev.totalPages - 1 ? prev : { ...prev, page: prev.page + 1 }
    );
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) =>
      prev.page <= 0 ? prev : { ...prev, page: prev.page - 1 }
    );
  }, []);

  const refetch = useCallback(() => {
    fetch(params);
  }, [fetch, params]);

  const hasNextPage = useMemo(
    () => pagination.page < pagination.totalPages - 1,
    [pagination.page, pagination.totalPages]
  );

  const hasPrevPage = useMemo(
    () => pagination.page > 0,
    [pagination.page]
  );

  return useMemo(
    () => ({
      ...fetchState,
      ...pagination,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage,
      refetch,
    }),
    [fetchState, pagination, hasNextPage, hasPrevPage, nextPage, prevPage, refetch]
  );
};

export default usePaginatedFetch;