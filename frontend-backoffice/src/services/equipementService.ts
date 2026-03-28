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
// Remplacer /api/equipements par /api/products/equipements partout

export async function fetchEquipements(filters: ProductFilters = {}): Promise<PageResult<EquipementDto>> {
  const { data } = await apiClient.get<PageResult<EquipementDto>>('/api/products/equipements', {
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

export async function fetchEquipementById(id: number): Promise<EquipementDto> {
  const { data } = await apiClient.get<EquipementDto>(`/api/products/equipements/${id}`);
  return data;
}

export async function createEquipement(payload: CreateEquipementRequest): Promise<EquipementDto> {
  const { data } = await apiClient.post<EquipementDto>('/api/products/equipements', payload);
  return data;
}

export async function updateEquipement(id: number, payload: UpdateEquipementRequest): Promise<EquipementDto> {
  const { data } = await apiClient.put<EquipementDto>(`/api/products/equipements/${id}`, payload);
  return data;
}

export async function deleteEquipement(id: number): Promise<void> {
  await apiClient.delete(`/api/products/equipements/${id}`);
}

export async function uploadEquipementImage(id: number, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ url: string }>(
    `/api/products/equipements/${id}/image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.url;
}