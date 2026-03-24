import axiosInstance from '../api/axiosInstance';
import type { EquipementCategory, EquipementCategoryRequest } from '../types/category';
import type { PagedModel, PageableParams } from '../types/api';

/**
 * Base URL for equipment categories — routed via gateway to product-service.
 */
const BASE = '/api/products/equipement-categories';

export async function fetchEquipementCategories(
  params: PageableParams = {},
): Promise<PagedModel<EquipementCategory>> {
  const { data } = await axiosInstance.get<PagedModel<EquipementCategory>>(BASE, { params });
  return data;
}

export async function fetchEquipementCategory(id: string): Promise<EquipementCategory> {
  const { data } = await axiosInstance.get<EquipementCategory>(`${BASE}/${id}`);
  return data;
}

export async function createEquipementCategory(
  payload: EquipementCategoryRequest,
): Promise<EquipementCategory> {
  const { data } = await axiosInstance.post<EquipementCategory>(BASE, payload);
  return data;
}

export async function updateEquipementCategory(
  id: string,
  payload: EquipementCategoryRequest,
): Promise<EquipementCategory> {
  const { data } = await axiosInstance.put<EquipementCategory>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteEquipementCategory(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}