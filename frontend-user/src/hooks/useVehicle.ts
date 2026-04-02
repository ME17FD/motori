import { useCallback } from "react";
import { useVehicleStore } from "../store/vehicleStore";
import type { SelectedVehicle } from "../types/vehicle.types";

/**
 * Ergonomic facade over `useVehicleStore` with stable callbacks for components that only need
 * read/update/clear without subscribing to the full store object.
 *
 * @returns `selectedVehicle` — persisted global choice; `setVehicle` / `clearVehicle` mutators
 */
export function useVehicle(): {
  selectedVehicle: SelectedVehicle | null;
  setVehicle: (vehicle: SelectedVehicle) => void;
  clearVehicle: () => void;
} {
  const selectedVehicle = useVehicleStore((s) => s.selectedVehicle);
  const set = useVehicleStore((s) => s.setVehicle);
  const clear = useVehicleStore((s) => s.clearVehicle);

  const setVehicle = useCallback((vehicle: SelectedVehicle) => set(vehicle), [set]);
  const clearVehicle = useCallback(() => clear(), [clear]);

  return { selectedVehicle, setVehicle, clearVehicle };
}
