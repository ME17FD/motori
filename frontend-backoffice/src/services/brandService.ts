/**
 * Brand Service
 * API client for brand CRUD operations and queries.
 * Endpoints hit the /api/brands gateway endpoint.
 */

import axiosInstance from '../api/axiosInstance';
import type { Brand, CreateBrandRequest, UpdateBrandRequest } from '../types/brand';
import type { PageResponse, PageableParams } from '../types/api';

const BASE = '/api/brands';

/**
 * GET /api/brands — paginated list.
 */
export async function fetchBrands(params: PageableParams = {}): Promise<PageResponse<Brand>> {
  const { data } = await axiosInstance.get<PageResponse<Brand>>(BASE, { params });
  return data;
}

/**
 * GET /api/brands/all — full list (for selects).
 */
export async function fetchAllBrands(): Promise<Brand[]> {
  const { data } = await axiosInstance.get<Brand[]>(`${BASE}/all`);
  return data;
}

/**
 * GET /api/brands/:id
 */
export async function fetchBrand(id: number): Promise<Brand> {
  const { data } = await axiosInstance.get<Brand>(`${BASE}/${id}`);
  return data;
}

/**
 * POST /api/brands
 */
export async function createBrand(payload: CreateBrandRequest): Promise<Brand> {
  const { data } = await axiosInstance.post<Brand>(BASE, payload);
  return data;
}

/**
 * PUT /api/brands/:id
 */
export async function updateBrand(id: number, payload: UpdateBrandRequest): Promise<Brand> {
  const { data } = await axiosInstance.put<Brand>(`${BASE}/${id}`, payload);
  return data;
}

/**
 * DELETE /api/brands/:id
 */
export async function deleteBrand(id: number): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}