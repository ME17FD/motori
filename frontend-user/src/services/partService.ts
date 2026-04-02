import apiClient from "../api/apiClient";
import { normalizePagedResponse } from "../api/normalizePagedResponse";
import { buildCleanParams } from "../utils/buildParams";
import type {
  PartResponse,
  PartRequest,
  PartPropertiesPatch,
  PartQueryParams,
  PagedParts,
} from "../types/part.types";
import type { UUID } from "../types/common.types";

const PART_DEFAULTS: Required<Pick<PartQueryParams, "page" | "size">> = {
  page: 0,
  size: 20,
};

const BASE = "/api/parts" as const;

/**
 * Maps catalog / UI filter objects to `PartQueryParams` expected by GET `/api/parts`.
 * - `search` → `name` (backend partial match on name/ref)
 * - `page` (1-based UI) → 0-based `page`
 * - `vehicleId` → `vehiculeId` (backend spelling)
 */
export function catalogParamsToPartQuery(raw: Record<string, unknown>): PartQueryParams {
  const searchRaw = raw.search;
  const search =
    typeof searchRaw === "string" && searchRaw.trim() !== "" ? searchRaw.trim() : undefined;
  const page1 = typeof raw.page === "number" ? raw.page : 1;
  const page0 = Math.max(0, page1 - 1);
  const size = typeof raw.pageSize === "number" ? raw.pageSize : PART_DEFAULTS.size;
  const vehicleRaw = raw.vehicleId;
  const categoryRaw = raw.categoryId;

  const vehiculeId =
    typeof vehicleRaw === "string" && vehicleRaw !== "" ? (vehicleRaw as UUID) : undefined;
  const categoryId =
    typeof categoryRaw === "string" && categoryRaw !== "" ? (categoryRaw as UUID) : undefined;

  const params: PartQueryParams = {
    page: page0,
    size,
    ...(search ? { name: search } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(vehiculeId ? { vehiculeId } : {}),
  };
  return params;
}

/**
 * Typed convenience wrapper for parts listing (vehicle + category ready for future filters).
 *
 * @param filters - Optional filters; `vehicleId` maps to backend `vehiculeId`
 * @returns Paginated parts in normalized `PagedModel` shape
 */
export async function getPartsFiltered(filters: {
  vehicleId?: string;
  categoryId?: string;
  page?: number;
  size?: number;
  name?: string;
}): Promise<PagedParts> {
  const { vehicleId, categoryId, page = 0, size = PART_DEFAULTS.size, name } = filters;
  return getParts({
    page,
    size,
    ...(name ? { name } : {}),
    ...(categoryId ? { categoryId: categoryId as UUID } : {}),
    ...(vehicleId ? { vehiculeId: vehicleId as UUID } : {}),
  });
}

/**
 * Paginated parts search with optional filters merged via `buildCleanParams`.
 * Supports `vehicleId` alias merged into `vehiculeId` when both would apply (explicit `vehiculeId` wins).
 *
 * @param params - Query fields (page/size defaults from `PART_DEFAULTS`)
 */
export const getParts = async (
  params: PartQueryParams & { vehicleId?: UUID } = {}
): Promise<PagedParts> => {
  const { vehicleId, vehiculeId, ...rest } = params;
  const mergedVehiculeId = vehiculeId ?? vehicleId;
  const resolved: PartQueryParams = {
    ...rest,
    ...(mergedVehiculeId !== undefined ? { vehiculeId: mergedVehiculeId } : {}),
  };

  const { data } = await apiClient.get<unknown>(BASE, {
    params: buildCleanParams(resolved, PART_DEFAULTS),
  });
  return normalizePagedResponse<PartResponse>(data);
};

/** Loads a single part by id (UUID). */
export const getPartById = async (id: string): Promise<PartResponse> => {
  const { data } = await apiClient.get<PartResponse>(`${BASE}/${id}`);
  return data;
};

export const createPart = async (payload: PartRequest): Promise<PartResponse> => {
  const { data } = await apiClient.post<PartResponse>(BASE, payload);
  return data;
};

export const updatePart = async (id: string, payload: PartRequest): Promise<PartResponse> => {
  const { data } = await apiClient.put<PartResponse>(`${BASE}/${id}`, payload);
  return data;
};

export const deletePart = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`);
};

export const uploadPartImage = async (id: string, file: File): Promise<PartResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post<PartResponse>(`${BASE}/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deletePartImage = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}/image`);
};

export const patchPartProperties = async (
  id: string,
  payload: PartPropertiesPatch
): Promise<PartResponse> => {
  const { data } = await apiClient.patch<PartResponse>(`${BASE}/${id}/properties`, payload);
  return data;
};
