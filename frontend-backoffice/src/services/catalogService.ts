/**
 * Catalog service — brands, categories, and vehicles endpoints.
 *
 * All requests go through the API Gateway.
 * Base paths (from product-service):
 *   /api/brands
 *   /api/categories
 *   /api/vehicles
 *
 * Note: The product-service API docs (api-docs_product.json) defines
 * the exact endpoint shapes. We follow REST conventions for CRUD.
 */

import apiClient from '../api/axiosInstance';
import type {
  BrandDto,
  BrandType,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '../types/brand';
import type {
  CategoryDto,
  CategoryType,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category';
import type {
  VehicleDto,
  CreateVehicleRequest,
  UpdateVehicleRequest,
} from '../types/vehicle';

// ─── Brands ────────────────────────────────────────────────────────────────

/** Fetch all brands of a given type */
export async function fetchBrandsByType(type: BrandType): Promise<BrandDto[]> {
  const { data } = await apiClient.get<BrandDto[]>('/api/brands', {
    params: { type },
  });
  return data;
}

/** Fetch a single brand by ID */
export async function fetchBrandById(id: number): Promise<BrandDto> {
  const { data } = await apiClient.get<BrandDto>(`/api/brands/${id}`);
  return data;
}

/** Create a new brand */
export async function createBrand(
  payload: CreateBrandRequest
): Promise<BrandDto> {
  const { data } = await apiClient.post<BrandDto>('/api/brands', payload);
  return data;
}

/** Update an existing brand */
export async function updateBrand(
  id: number,
  payload: UpdateBrandRequest
): Promise<BrandDto> {
  const { data } = await apiClient.put<BrandDto>(`/api/brands/${id}`, payload);
  return data;
}

/** Soft-delete a brand */
export async function deleteBrand(id: number): Promise<void> {
  await apiClient.delete(`/api/brands/${id}`);
}

// ─── Categories ────────────────────────────────────────────────────────────

/** Fetch all categories of a given type */
export async function fetchCategoriesByType(
  type: CategoryType
): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<CategoryDto[]>('/api/categories', {
    params: { type },
  });
  return data;
}

/** Fetch full category tree (nested children) */
export async function fetchCategoryTree(
  type: CategoryType
): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<CategoryDto[]>(
    '/api/categories/tree',
    { params: { type } }
  );
  return data;
}

/** Fetch a single category by ID */
export async function fetchCategoryById(id: number): Promise<CategoryDto> {
  const { data } = await apiClient.get<CategoryDto>(`/api/categories/${id}`);
  return data;
}

/** Create a new category */
export async function createCategory(
  payload: CreateCategoryRequest
): Promise<CategoryDto> {
  const { data } = await apiClient.post<CategoryDto>(
    '/api/categories',
    payload
  );
  return data;
}

/** Update an existing category */
export async function updateCategory(
  id: number,
  payload: UpdateCategoryRequest
): Promise<CategoryDto> {
  const { data } = await apiClient.put<CategoryDto>(
    `/api/categories/${id}`,
    payload
  );
  return data;
}

/** Delete a category */
export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/api/categories/${id}`);
}

// ─── Vehicles ──────────────────────────────────────────────────────────────

/** Fetch all vehicles, optionally filtered by brand */
export async function fetchVehicles(brandId?: number): Promise<VehicleDto[]> {
  const { data } = await apiClient.get<VehicleDto[]>('/api/vehicles', {
    params: brandId ? { brandId } : undefined,
  });
  return data;
}

/** Fetch a single vehicle by ID */
export async function fetchVehicleById(id: number): Promise<VehicleDto> {
  const { data } = await apiClient.get<VehicleDto>(`/api/vehicles/${id}`);
  return data;
}

/** Create a new vehicle */
export async function createVehicle(
  payload: CreateVehicleRequest
): Promise<VehicleDto> {
  const { data } = await apiClient.post<VehicleDto>('/api/vehicles', payload);
  return data;
}

/** Update an existing vehicle */
export async function updateVehicle(
  id: number,
  payload: UpdateVehicleRequest
): Promise<VehicleDto> {
  const { data } = await apiClient.put<VehicleDto>(
    `/api/vehicles/${id}`,
    payload
  );
  return data;
}

/** Delete a vehicle */
export async function deleteVehicle(id: number): Promise<void> {
  await apiClient.delete(`/api/vehicles/${id}`);
}