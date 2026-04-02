import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompatibleParts } from "../services/compatibilityService";
import { queryKeys } from "../api/queryKeys";
import parseError from "../utils/parseError";
import type { PartResponse } from "../types/part.types";
import type { UUID } from "../types/common.types";
import { useVehicleStore } from "../store/vehicleStore";

export interface UseVehicleFilterReturn {
  selectedVehicleId: UUID | null;
  compatibleParts: readonly PartResponse[];
  loading: boolean;
  error: string | null;
}

/**
 * When a vehicle is selected, loads compatible parts via GET compatibilities (React Query).
 */
const useVehicleFilter = (): UseVehicleFilterReturn => {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicle?.id ?? null);

  const q = useQuery({
    queryKey: selectedVehicleId
      ? queryKeys.compatibility.partsByVehicle(selectedVehicleId)
      : [...queryKeys.compatibility.all, "idle"],
    queryFn: () => getCompatibleParts(selectedVehicleId!),
    enabled: !!selectedVehicleId,
  });

  return useMemo(
    () => ({
      selectedVehicleId,
      compatibleParts: q.data ?? [],
      loading: q.isFetching,
      error: q.isError ? parseError(q.error) : null,
    }),
    [selectedVehicleId, q.data, q.isFetching, q.isError, q.error]
  );
};

export default useVehicleFilter;
