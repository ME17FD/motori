import { useState, useCallback, useMemo } from "react";
import { getCompatibleParts } from "../services/compatibilityService";
import useAsyncState from "./useAsyncState";
import type { PartResponse } from "../types/part.types";
import type { UUID } from "../types/common.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UseVehicleFilterReturn {
  // State
  selectedVehicleId: UUID | null;
  compatibleParts: readonly PartResponse[];
  loading: boolean;
  error: string | null;
  // Actions
  selectVehicle: (vehiculeId: UUID) => Promise<void>;
  clearVehicle: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const useVehicleFilter = (): UseVehicleFilterReturn => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<UUID | null>(null);

  const { state, setLoading, setSuccess, setError } =
    useAsyncState<readonly PartResponse[]>([]);

  // ── Select vehicle + fetch compatible parts ────────────────────────────────

  const selectVehicle = useCallback(async (vehiculeId: UUID) => {
    setSelectedVehicleId(vehiculeId);
    setLoading();

    try {
      const parts = await getCompatibleParts(vehiculeId);
      setSuccess(parts);
    } catch (err) {
      setError(err, "Failed to fetch compatible parts.");
    }
  }, [setLoading, setSuccess, setError]);

  // ── Clear selection ────────────────────────────────────────────────────────

  const clearVehicle = useCallback(() => {
    setSelectedVehicleId(null);
    setSuccess([]);
  }, [setSuccess]);

  // Stable return reference
  return useMemo(
    () => ({
      selectedVehicleId,
      compatibleParts: state.data,
      loading: state.loading,
      error: state.error,
      selectVehicle,
      clearVehicle,
    }),
    [selectedVehicleId, state, selectVehicle, clearVehicle]
  );
};

export default useVehicleFilter;