import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SelectedVehicle } from "../types/vehicle.types";
import { SELECTED_VEHICLE_STORAGE_KEY } from "../constants/vehicle.constants";

/**
 * Global vehicle selection (source of truth for compatibility-style filtering).
 *
 * **State flow**
 * - `selectedVehicle` is `null` when the user has not chosen a bike, or after `clearVehicle`.
 * - `setVehicle` replaces the whole object (typically from `VehicleSelector` after the user confirms).
 * - Consumers read the same snapshot everywhere (Navbar, hooks, pages).
 *
 * **Persistence**
 * - Zustand `persist` writes `selectedVehicle` to `localStorage` under `SELECTED_VEHICLE_STORAGE_KEY`.
 * - On first load, the middleware rehydrates from storage before React renders, so `useParts` query keys
 *   include the stored `vehicleId` immediately and React Query fetches the correct catalog.
 * - Only `selectedVehicle` is persisted (no transient UI flags).
 */
export interface VehicleStoreState {
  selectedVehicle: SelectedVehicle | null;
  setVehicle: (vehicle: SelectedVehicle) => void;
  clearVehicle: () => void;
}

export const useVehicleStore = create<VehicleStoreState>()(
  persist(
    (set) => ({
      selectedVehicle: null,
      setVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
      clearVehicle: () => set({ selectedVehicle: null }),
    }),
    {
      name: SELECTED_VEHICLE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedVehicle: state.selectedVehicle }),
    }
  )
);