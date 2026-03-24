import axiosInstance from '../api/axiosInstance';
import type {
  Equipement,
  EquipementRequest,
  EquipementUpdateRequest,
  DynamicProperties,
} from '../types/product';
import type { PagedModel } from '../types/api';

/**
 * Base URL for equipment — gateway rewrites /api/products/** → /api/parts/**.
 */
const BASE = '/api/products/equipements';

export interface EquipementFilters {
  name?: string;
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  propertyKey?: string;
  propertyValue?: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

/**
 * GET /api/products/equipements — paginated + filtered list.
 */
export async function fetchEquipements(
  params: EquipementFilters = {},
): Promise<PagedModel<Equipement>> {
  const { data } = await axiosInstance.get<PagedModel<Equipement>>(BASE, { params });
  return data;
}

export async function fetchEquipement(id: string): Promise<Equipement> {
  const { data } = await axiosInstance.get<Equipement>(`${BASE}/${id}`);
  return data;
}

export async function createEquipement(
  payload: EquipementRequest,
): Promise<Equipement> {
  const { data } = await axiosInstance.post<Equipement>(BASE, payload);
  return data;
}

export async function updateEquipement(
  id: string,
  payload: EquipementUpdateRequest,
): Promise<Equipement> {
  const { data } = await axiosInstance.put<Equipement>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteEquipement(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}

/**
 * POST /api/products/equipements/{id}/image
 * Uploads a single image file to Minio via the gateway.
 */
export async function uploadEquipementImage(
  id: string,
  file: File,
): Promise<Equipement> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosInstance.post<Equipement>(
    `${BASE}/${id}/image`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/**
 * DELETE /api/products/equipements/{id}/image
 */
export async function deleteEquipementImage(id: string): Promise<Equipement> {
  const { data } = await axiosInstance.delete<Equipement>(`${BASE}/${id}/image`);
  return data;
}

/**
 * PATCH /api/products/equipements/{id}/properties
 * Updates JSONB dynamic properties for an equipment item.
 */
export async function updateEquipementProperties(
  id: string,
  properties: DynamicProperties,
): Promise<Equipement> {
  const { data } = await axiosInstance.patch<Equipement>(
    `${BASE}/${id}/properties`,
    properties,
  );
  return data;
}