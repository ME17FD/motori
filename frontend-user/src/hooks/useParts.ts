import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { catalogParamsToPartQuery, getParts } from "../services/partService";
import { queryKeys } from "../api/queryKeys";
import parseError from "../utils/parseError";
import { useVehicleStore } from "../store/vehicleStore";
import type { PartResponse } from "../types/part.types";

export interface UsePartsReturn {
  parts: PartResponse[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Paginated parts catalog via React Query. Pass the same shape the Parts page builds
 * (`search`, 1-based `page`, `pageSize`, `vehicleId`, …); it is mapped to `PartQueryParams` internally.
 *
 * **Global vehicle:** when `catalogParams.vehicleId` is missing, the hook injects the persisted
 * `selectedVehicle.id` from `useVehicleStore`, so the query key updates when the user changes
 * their bike in the Navbar and React Query refetches automatically.
 */
const useParts = (catalogParams: Record<string, unknown> = {}): UsePartsReturn => {
  const globalVehicleId = useVehicleStore((s) => s.selectedVehicle?.id ?? null);
  const disableVehicleInjection = Boolean(catalogParams.disableVehicleInjection);

  const mergedCatalogParams = useMemo(() => {
    const raw = catalogParams.vehicleId;
    const hasExplicit =
      raw !== undefined &&
      raw !== null &&
      (typeof raw !== "string" || raw.trim() !== "");
    const vehicleId = hasExplicit ? raw : globalVehicleId;

    // When the caller wants the *full* catalog (compatibility computed in UI),
    // disable the automatic injection of the persisted vehicle id.
    if (disableVehicleInjection && !hasExplicit) return catalogParams;

    if (vehicleId === null || vehicleId === undefined) return catalogParams;
    return { ...catalogParams, vehicleId };
  }, [catalogParams, globalVehicleId, disableVehicleInjection]);

  const apiParams = useMemo(
    () => catalogParamsToPartQuery(mergedCatalogParams),
    [mergedCatalogParams]
  );

  const queryKeyParams = (() => {
    if (!disableVehicleInjection) return apiParams;

    // Keep a stable refetch when vehicle changes even if we don't send `vehiculeId` to the API.
    const raw = catalogParams.vehicleId;
    const hasExplicit =
      raw !== undefined &&
      raw !== null &&
      (typeof raw !== "string" || raw.trim() !== "");
    if (hasExplicit) return apiParams;

    return {
      ...(apiParams as object),
      // Extra field for cache identity only (not used by `catalogParamsToPartQuery`).
      vehicleIdForKey: globalVehicleId,
    } as typeof apiParams;
  })();

  const q = useQuery({
    queryKey: queryKeys.parts.list(queryKeyParams),
    queryFn: () => getParts(apiParams),
    placeholderData: keepPreviousData,
  });

  return useMemo(
    () => ({
      parts: q.data?.content ?? [],
      loading: q.isPending && !q.isPlaceholderData,
      error: q.isError ? parseError(q.error) : null,
      totalPages: q.data?.page.totalPages ?? 0,
      refetch: q.refetch,
      isFetching: q.isFetching,
    }),
    [q.data, q.isPending, q.isPlaceholderData, q.isError, q.error, q.isFetching, q.refetch]
  );
};

export default useParts;
