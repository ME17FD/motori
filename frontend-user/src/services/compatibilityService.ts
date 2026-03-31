import axiosInstance from "../api/axiosInstance";
import { buildCleanParams } from "../utils/buildParams";
import type {
  CompatibilityResponse,
  CompatibilityQueryParams,
  PagedCompatibility,
} from "../types/compatibility.types";
import type { PartResponse } from "../types/part.types";
import type { UUID } from "../types/common.types";

const BASE = "/api/compatibilities" as const;

const COMPATIBILITY_DEFAULTS: Required<Pick<CompatibilityQueryParams, "page" | "size">> = {
  page: 0,
  size: 100, // High limit — fetch all compatible parts in one shot
};

// ── GET /api/compatibilities ──────────────────────────────────────────────────
// Private — internal building block, not exposed to consumers

const getCompatibilities = async (
  params: CompatibilityQueryParams = {}
): Promise<readonly CompatibilityResponse[]> => {
  const { data } = await axiosInstance.get<PagedCompatibility>(BASE, {
    params: buildCleanParams(params, COMPATIBILITY_DEFAULTS),
  });
  return data.content;
};

// ── getCompatibleParts(vehiculeId) ────────────────────────────────────────────
// Public — consumers get PartResponse[] directly, no join table unwrapping needed

export const getCompatibleParts = async (
  vehiculeId: UUID
): Promise<readonly PartResponse[]> => {
  const compatibilities = await getCompatibilities({ vehiculeId });
  return compatibilities.map(({ part }) => part);
};