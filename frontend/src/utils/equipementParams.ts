// Isolated mapper — owns the clothingSize → `size` and
// pageSize → `size` resolution so the service stays clean.
// Extracted into utils (not inside the service) so it can be
// unit-tested independently without importing axios.

import { buildCleanParams } from "./buildParams";
import type { EquipementQueryParams } from "../types/equipement.types";

const EQUIPEMENT_DEFAULTS = {
  page: 0,
  size: 20, // API param name for pagination
} as const;

/**
 * Maps UI-facing `EquipementQueryParams` to query keys the backend expects
 * (`clothingSize` / `pageSize` both compete for the `size` key — pagination wins when both set).
 *
 * @param params - Raw filter + pagination object from hooks
 */
export const mapEquipementParams = (
  params: EquipementQueryParams
): Partial<Record<string, unknown>> => {
  // Destructure aliased keys — everything else passes through as-is
  const { clothingSize, pageSize, ...rest } = params;

  return buildCleanParams(
    {
      ...rest,
      // clothingSize → `size` filter param
      ...(clothingSize !== undefined && { size: clothingSize }),
      // pageSize → `size` pagination param
      // pageSize takes precedence over clothingSize if both provided (edge case)
      ...(pageSize !== undefined && { size: pageSize }),
    },
    EQUIPEMENT_DEFAULTS
  );
};