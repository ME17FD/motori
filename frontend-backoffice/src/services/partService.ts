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

export async function fetchParts(filters: ProductFilters = {}): Promise<PageResult<PartDto>> {
  const { data } = await apiClient.get<PageResult<PartDto>>('/api/products/parts', {
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

export async function fetchPartById(id: number): Promise<PartDto> {
  const { data } = await apiClient.get<PartDto>(`/api/products/parts/${id}`);
  return data;
}

export async function createPart(payload: CreatePartRequest): Promise<PartDto> {
  const { data } = await apiClient.post<PartDto>('/api/products/parts', payload);
  return data;
}

export async function updatePart(id: number, payload: UpdatePartRequest): Promise<PartDto> {
  const { data } = await apiClient.put<PartDto>(`/api/products/parts/${id}`, payload);
  return data;
}

export async function deletePart(id: number): Promise<void> {
  await apiClient.delete(`/api/products/parts/${id}`);
}

export async function uploadPartImage(id: number, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ url: string }>(
    `/api/products/parts/${id}/image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.url;
}