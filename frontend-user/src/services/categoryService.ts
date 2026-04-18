import apiClient from "../api/apiClient";
import { normalizePagedResponse } from "../api/normalizePagedResponse";
import { buildCleanParams } from "../utils/buildParams";
import type { UUID, ISODateString, PagedModel } from "../types/common.types";

const BASE = "/part-categories" as const;

/** Subset of product-service `PartCategoryResponse` for list/detail calls. */
export interface PartCategoryResponse {
  readonly id: UUID;
  readonly name: string;
  readonly parentCategoryId?: UUID | null;
  readonly createdAt?: ISODateString;
  readonly updatedAt?: ISODateString;
}

/**
 * Paginated list of part categories (Spring `Page` normalized to `PagedModel`).
 *
 * @param page - 0-based page index
 * @param size - page size (capped by backend)
 */
export const getPartCategories = async (
  page = 0,
  size = 50
): Promise<PagedModel<PartCategoryResponse>> => {
  const { data } = await apiClient.get<unknown>(BASE, {
    params: buildCleanParams({ page, size }),
  });
  return normalizePagedResponse<PartCategoryResponse>(data);
};

/**
 * Single category by id (cached on server).
 *
 * @param id - Category UUID
 */
export const getPartCategoryById = async (id: UUID): Promise<PartCategoryResponse> => {
  const { data } = await apiClient.get<PartCategoryResponse>(`${BASE}/${id}`);
  return data;
};
