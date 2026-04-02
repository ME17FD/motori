import type { UUID } from "../../types/common.types";
import type { SelectedVehicle } from "../../types/vehicle.types";

/**
 * UI-only compatibility helper.
 *
 * Backend `PartResponse` does not expose a direct `isCompatible` field.
 * Instead, we use GET `/api/compatibilities?vehiculeId=...` (see `useVehicleFilter`)
 * to build a set of compatible `part.id`s, then let the UI decide.
 *
 * This helper supports:
 * - explicit compatibility fields (if ever returned in the API)
 * - membership in `selectedVehicle.compatiblePartIds` (preferred)
 * - optimistic fallback: when the UI fetched parts using `vehiculeId`, we can assume
 *   returned parts are compatible (flagged via `selectedVehicle.assumeAllCompatible`)
 */
export type VehicleCompatibilityContext =
  | (SelectedVehicle & {
      readonly compatiblePartIds?: ReadonlySet<UUID>;
      readonly assumeAllCompatible?: boolean;
    })
  | null;

export function isProductCompatible(
  product: { readonly id?: UUID },
  selectedVehicle: VehicleCompatibilityContext
): boolean | null {
  if (!selectedVehicle) return null;

  // If backend starts returning an explicit field, honor it.
  const explicit = (product as { readonly isCompatible?: unknown }).isCompatible;
  if (typeof explicit === "boolean") return explicit;

  // Preferred: membership in the compatible parts set built from `/api/compatibilities`.
  const compatiblePartIds = selectedVehicle.compatiblePartIds;
  if (compatiblePartIds && product.id) return compatiblePartIds.has(product.id);

  // Fallback: if UI requested `vehiculeId`, assume the server already filtered.
  if (selectedVehicle.assumeAllCompatible) return true;

  return null;
}

