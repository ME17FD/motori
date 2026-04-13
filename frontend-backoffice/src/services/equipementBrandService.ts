import axiosInstance from '../api/axiosInstance';
import type { EquipementBrand, EquipementBrandRequest } from '../types/brand';
import type { PagedModel, PageableParams } from '../types/api';

/**
 * Base URL for equipment brands — routed via gateway to product-service.
 */
const BASE = '/api/products/equipement-brands';

export async function fetchEquipementBrands(
  params: PageableParams = {},
): Promise<PagedModel<EquipementBrand>> {
  const { data } = await axiosInstance.get<PagedModel<EquipementBrand>>(BASE, { params });
  return data;
}

export async function fetchEquipementBrand(id: string): Promise<EquipementBrand> {
  const { data } = await axiosInstance.get<EquipementBrand>(`${BASE}/${id}`);
  return data;
}

export async function createEquipementBrand(
  payload: EquipementBrandRequest,
): Promise<EquipementBrand> {
  const { data } = await axiosInstance.post<EquipementBrand>(BASE, payload);
  return data;
}

export async function updateEquipementBrand(
  id: string,
  payload: EquipementBrandRequest,
): Promise<EquipementBrand> {
  const { data } = await axiosInstance.put<EquipementBrand>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteEquipementBrand(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}