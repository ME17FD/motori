import type { UUID } from "./common.types";

/**
 * Motorcycle the user chose as the global context for compatibility-aware browsing.
 * `id` is the backend vehicle UUID (`vehiculeId` on parts APIs); labels are for display only.
 */
export interface SelectedVehicle {
  readonly id: UUID;
  readonly brandName: string;
  readonly modelName: string;
  readonly year?: number;
}
