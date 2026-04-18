import apiClient from "../api/apiClient";
import { normalizePagedResponse } from "../api/normalizePagedResponse";
import { buildCleanParams } from "../utils/buildParams";
import type { CompatibilityResponse, CompatibilityQueryParams } from "../types/compatibility.types";
import type { PartResponse } from "../types/part.types";
import type { UUID } from "../types/common.types";

const BASE = "/compatibilities" as const;

const COMPATIBILITY_DEFAULTS: Required<Pick<CompatibilityQueryParams, "page" | "size">> = {
  page: 0,
  size: 100, // High limit — fetch all compatible parts in one shot
};

// ── GET /api/compatibilities ──────────────────────────────────────────────────
// Private — internal building block, not exposed to consumers

const getCompatibilities = async (
  params: CompatibilityQueryParams = {}
): Promise<readonly CompatibilityResponse[]> => {
  const { data } = await apiClient.get<unknown>(BASE, {
    params: buildCleanParams(params, COMPATIBILITY_DEFAULTS),
  });
  return normalizePagedResponse<CompatibilityResponse>(data).content;
};

// ── getCompatibleParts(vehiculeId) ────────────────────────────────────────────
// Public — consumers get PartResponse[] directly, no join table unwrapping needed

export const getCompatibleParts = async (
  vehiculeId: UUID
): Promise<readonly PartResponse[]> => {
  const compatibilities = await getCompatibilities({ vehiculeId });
  return compatibilities.map(({ part }) => part);
};