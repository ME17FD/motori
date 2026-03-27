/**
 * Equipement service — CRUD + search for gear/equipment.
 * Base path: /api/equipements (through API Gateway)
 */

import apiClient from '../api/axiosInstance';
import type {
  EquipementDto,
  CreateEquipementRequest,
  UpdateEquipementRequest,
  PageResult,
  ProductFilters,
} from '../types/product';

/** Fetch paginated + filtered equipements */
export async function fetchEquipements(
  filters: ProductFilters = {}
): Promise<PageResult<EquipementDto>> {
  const { data } = await apiClient.get<PageResult<EquipementDto>>(
    '/api/equipements',
    {
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
    }
  );
  return data;
}

/** Fetch a single equipement by ID */
export async function fetchEquipementById(id: number): Promise<EquipementDto> {
  const { data } = await apiClient.get<EquipementDto>(`/api/equipements/${id}`);
  return data;
}

/** Create a new equipement */
export async function createEquipement(
  payload: CreateEquipementRequest
): Promise<EquipementDto> {
  const { data } = await apiClient.post<EquipementDto>(
    '/api/equipements',
    payload
  );
  return data;
}

/** Update an existing equipement */
export async function updateEquipement(
  id: number,
  payload: UpdateEquipementRequest
): Promise<EquipementDto> {
  const { data } = await apiClient.put<EquipementDto>(
    `/api/equipements/${id}`,
    payload
  );
  return data;
}

/** Delete an equipement */
export async function deleteEquipement(id: number): Promise<void> {
  await apiClient.delete(`/api/equipements/${id}`);
}

/** Upload an equipement image to MinIO */
export async function uploadEquipementImage(
  id: number,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ url: string }>(
    `/api/equipements/${id}/image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.url;
}