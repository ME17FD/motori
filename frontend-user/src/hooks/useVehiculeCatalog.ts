import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { getAllVehiculeBrands, getAllVehicules } from "../services/vehiculeService";

const CATALOG_STALE_MS = 5 * 60_000;

/**
 * Brands + vehicles for the global motorcycle picker (aligned with product-service GET endpoints).
 */
export function useVehiculeCatalog() {
  const brandsQuery = useQuery({
    queryKey: queryKeys.vehiculeBrands.list(),
    queryFn: getAllVehiculeBrands,
    staleTime: CATALOG_STALE_MS,
  });

  const vehiculesQuery = useQuery({
    queryKey: queryKeys.vehicules.list(),
    queryFn: getAllVehicules,
    staleTime: CATALOG_STALE_MS,
  });

  return {
    brands: brandsQuery.data ?? [],
    vehicules: vehiculesQuery.data ?? [],
    isLoading: brandsQuery.isPending || vehiculesQuery.isPending,
    isError: brandsQuery.isError || vehiculesQuery.isError,
    error: brandsQuery.error ?? vehiculesQuery.error,
    refetch: async () => {
      await Promise.all([brandsQuery.refetch(), vehiculesQuery.refetch()]);
    },
  };
}
