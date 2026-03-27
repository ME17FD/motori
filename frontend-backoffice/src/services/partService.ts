/**
 * Part service — CRUD + search for spare parts.
 * Base path: /api/parts (through API Gateway)
 */

import apiClient from '../api/axiosInstance';
import type {
  PartDto,
  CreatePartRequest,
  UpdatePartRequest,
  PageResult,
  ProductFilters,
} from '../types/product';

/** Fetch paginated + filtered parts */
export async function fetchParts(
  filters: ProductFilters = {}
): Promise<PageResult<PartDto>> {
  const { data } = await apiClient.get<PageResult<PartDto>>('/api/parts', {
    params: {
      name:       filters.name,
      brandId:    filters.brandId,
      categoryId: filters.categoryId,
      minPrice:   filters.minPrice,
      maxPrice:   filters.maxPrice,
      status:     filters.status,
      page:       filters.page ?? 0,
      size:       filters.size ?? 20,
      sort:       filters.sort,
    },
  });
  return data;
}

/** Fetch a single part by ID */
export async function fetchPartById(id: number): Promise<PartDto> {
  const { data } = await apiClient.get<PartDto>(`/api/parts/${id}`);
  return data;
}

/** Create a new part */
export async function createPart(
  payload: CreatePartRequest
): Promise<PartDto> {
  const { data } = await apiClient.post<PartDto>('/api/parts', payload);
  return data;
}

/** Update an existing part */
export async function updatePart(
  id: number,
  payload: UpdatePartRequest
): Promise<PartDto> {
  const { data } = await apiClient.put<PartDto>(`/api/parts/${id}`, payload);
  return data;
}

/** Delete a part */
export async function deletePart(id: number): Promise<void> {
  await apiClient.delete(`/api/parts/${id}`);
}

/**
 * Upload a part image to MinIO via the product-service.
 * Returns the public image URL stored in MinIO.
 */
export async function uploadPartImage(
  id: number,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ url: string }>(
    `/api/parts/${id}/image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.url;
}