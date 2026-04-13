    import axiosInstance from '../api/axiosInstance';
import type { PartCategory, PartCategoryRequest } from '../types/category';
import type { PagedModel, PageableParams } from '../types/api';

/**
 * Base URL for part categories — routed via gateway to product-service.
 */
const BASE = '/api/products/part-categories';

export async function fetchPartCategories(
  params: PageableParams = {},
): Promise<PagedModel<PartCategory>> {
  const { data } = await axiosInstance.get<PagedModel<PartCategory>>(BASE, { params });
  return data;
}

export async function fetchPartCategory(id: string): Promise<PartCategory> {
  const { data } = await axiosInstance.get<PartCategory>(`${BASE}/${id}`);
  return data;
}

export async function createPartCategory(
  payload: PartCategoryRequest,
): Promise<PartCategory> {
  const { data } = await axiosInstance.post<PartCategory>(BASE, payload);
  return data;
}

export async function updatePartCategory(
  id: string,
  payload: PartCategoryRequest,
): Promise<PartCategory> {
  const { data } = await axiosInstance.put<PartCategory>(`${BASE}/${id}`, payload);
  return data;
}

export async function deletePartCategory(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}