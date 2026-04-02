import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPartById } from "../services/partService";
import { queryKeys } from "../api/queryKeys";
import parseError from "../utils/parseError";
import type { PartResponse } from "../types/part.types";
import type { UUID } from "../types/common.types";

export interface UsePartReturn {
  part: PartResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Single part detail via React Query; disabled when `id` is null.
 */
const usePart = (id: UUID | null): UsePartReturn => {
  const q = useQuery({
    queryKey: id ? queryKeys.parts.detail(id) : [...queryKeys.parts.details(), "disabled"],
    queryFn: () => getPartById(id as string),
    enabled: !!id,
  });

  return useMemo(
    () => ({
      part: q.data ?? null,
      loading: q.isPending,
      error: q.isError ? parseError(q.error) : null,
      refetch: q.refetch,
    }),
    [q.data, q.isPending, q.isError, q.error, q.refetch]
  );
};

export default usePart;
