import axiosInstance from '../api/axiosInstance';
import type {
  Part,
  PartRequest,
  PartUpdateRequest,
  DynamicProperties,
} from '../types/product';
import type { PagedModel } from '../types/api';

/**
 * Base URL for parts — gateway rewrites /api/products/** → /api/parts/**.
 */
const BASE = '/api/products/parts';

export interface PartFilters {
  name?: string;
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  vehiculeId?: string;
  propertyKey?: string;
  propertyValue?: string;
  page?: number;
  size?: number;
  [key: string]: unknown;
}

/**
 * GET /api/products/parts — paginated + filtered list.
 */
export async function fetchParts(
  params: PartFilters = {},
): Promise<PagedModel<Part>> {
  const { data } = await axiosInstance.get<PagedModel<Part>>(BASE, { params });
  return data;
}

export async function fetchPart(id: string): Promise<Part> {
  const { data } = await axiosInstance.get<Part>(`${BASE}/${id}`);
  return data;
}

export async function createPart(payload: PartRequest): Promise<Part> {
  const { data } = await axiosInstance.post<Part>(BASE, payload);
  return data;
}

export async function updatePart(
  id: string,
  payload: PartUpdateRequest,
): Promise<Part> {
  const { data } = await axiosInstance.put<Part>(`${BASE}/${id}`, payload);
  return data;
}

export async function deletePart(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}

/**
 * POST /api/products/parts/{id}/image
 * Uploads a single image file to Minio via the gateway.
 */
export async function uploadPartImage(id: string, file: File): Promise<Part> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosInstance.post<Part>(
    `${BASE}/${id}/image`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/**
 * DELETE /api/products/parts/{id}/image
 */
export async function deletePartImage(id: string): Promise<Part> {
  const { data } = await axiosInstance.delete<Part>(`${BASE}/${id}/image`);
  return data;
}

/**
 * PATCH /api/products/parts/{id}/properties
 * Updates JSONB dynamic properties for a part.
 */
export async function updatePartProperties(
  id: string,
  properties: DynamicProperties,
): Promise<Part> {
  const { data } = await axiosInstance.patch<Part>(
    `${BASE}/${id}/properties`,
    properties,
  );
  return data;
}