import axiosInstance from '../api/axiosInstance';
import type { PartBrand, PartBrandRequest } from '../types/brand';
import type { PagedModel, PageableParams } from '../types/api';

/**
 * Base URL for part brands — routed via gateway to product-service.
 * Gateway rewrites /api/products/** → /api/parts/** internally.
 */
const BASE = '/api/products/part-brands';

export async function fetchPartBrands(
  params: PageableParams = {},
): Promise<PagedModel<PartBrand>> {
  const { data } = await axiosInstance.get<PagedModel<PartBrand>>(BASE, { params });
  return data;
}

export async function fetchPartBrand(id: string): Promise<PartBrand> {
  const { data } = await axiosInstance.get<PartBrand>(`${BASE}/${id}`);
  return data;
}

export async function createPartBrand(payload: PartBrandRequest): Promise<PartBrand> {
  const { data } = await axiosInstance.post<PartBrand>(BASE, payload);
  return data;
}

export async function updatePartBrand(
  id: string,
  payload: PartBrandRequest,
): Promise<PartBrand> {
  const { data } = await axiosInstance.put<PartBrand>(`${BASE}/${id}`, payload);
  return data;
}

export async function deletePartBrand(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}   