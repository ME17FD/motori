/**
 * Catalog service — brands, categories, and vehicles endpoints.
 *
 * Note on response shapes:
 *   Brand and category endpoints return paginated Page<T> objects from Spring,
 *   not raw arrays. We extract the .content array before returning.
 *   Vehicle endpoints may vary — handled with a safe fallback.
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

// ─── Helper ────────────────────────────────────────────────────────────────

/**
 * Safely extracts an array from either a raw array or a Spring Page response.
 * Handles: T[] | { content: T[] } | { content: T[], totalElements: number, ... }
 */
function extractArray<T>(response: T[] | { content: T[] } | unknown): T[] {
  if (Array.isArray(response)) return response;
  if (
    response !== null &&
    typeof response === 'object' &&
    'content' in (response as object) &&
    Array.isArray((response as { content: T[] }).content)
  ) {
    return (response as { content: T[] }).content;
  }
  console.warn('[catalogService] Unexpected response shape:', response);
  return [];
}

// ─── Brands ────────────────────────────────────────────────────────────────

const BRAND_PATHS: Record<BrandType, string> = {
  VehiculeBrand:   '/api/products/vehicule-brands',
  PartBrand:       '/api/products/part-brands',
  EquipementBrand: '/api/products/equipement-brands',
};

const CATEGORY_PATHS: Record<CategoryType, string> = {
  PartCategory:       '/api/products/part-categories',
  EquipementCategory: '/api/products/equipement-categories',
};

/** Fetch all brands of a given type */
export async function fetchBrandsByType(type: BrandType): Promise<BrandDto[]> {
  const { data } = await apiClient.get<unknown>(BRAND_PATHS[type]);
  return extractArray<BrandDto>(data);
}

/** Create a new brand */
export async function createBrand(payload: CreateBrandRequest): Promise<BrandDto> {
  const { data } = await apiClient.post<BrandDto>(BRAND_PATHS[payload.type], payload);
  return data;
}

/** Update an existing brand */
export async function updateBrand(
  id: number,
  payload: UpdateBrandRequest & { type: BrandType }
): Promise<BrandDto> {
  const { data } = await apiClient.put<BrandDto>(
    `${BRAND_PATHS[payload.type]}/${id}`,
    payload
  );
  return data;
}

/** Soft-delete a brand */
export async function deleteBrand(id: number, type: BrandType): Promise<void> {
  await apiClient.delete(`${BRAND_PATHS[type]}/${id}`);
}

// ─── Categories ────────────────────────────────────────────────────────────

/** Fetch all categories of a given type */
export async function fetchCategoriesByType(
  type: CategoryType
): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<unknown>(CATEGORY_PATHS[type]);
  return extractArray<CategoryDto>(data);
}

/** Fetch full category tree */
export async function fetchCategoryTree(
  type: CategoryType
): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<unknown>(
    `${CATEGORY_PATHS[type]}/tree`
  );
  return extractArray<CategoryDto>(data);
}

/** Fetch a single category by ID */
export async function fetchCategoryById(id: number): Promise<CategoryDto> {
  const { data } = await apiClient.get<CategoryDto>(`/api/products/part-categories/${id}`);
  return data;
}

/** Create a new category */
export async function createCategory(
  payload: CreateCategoryRequest
): Promise<CategoryDto> {
  const { data } = await apiClient.post<CategoryDto>(
    CATEGORY_PATHS[payload.type],
    payload
  );
  return data;
}

/** Update an existing category */
export async function updateCategory(
  id: number,
  payload: UpdateCategoryRequest & { type: CategoryType }
): Promise<CategoryDto> {
  const { data } = await apiClient.put<CategoryDto>(
    `${CATEGORY_PATHS[payload.type]}/${id}`,
    payload
  );
  return data;
}

/** Delete a category */
export async function deleteCategory(
  id: number,
  type: CategoryType
): Promise<void> {
  await apiClient.delete(`${CATEGORY_PATHS[type]}/${id}`);
}

// ─── Vehicles ──────────────────────────────────────────────────────────────

/** Fetch all vehicles, optionally filtered by brand */
export async function fetchVehicles(brandId?: number): Promise<VehicleDto[]> {
  const { data } = await apiClient.get<unknown>('/api/products/vehicules', {
    params: brandId ? { brandId } : undefined,
  });
  return extractArray<VehicleDto>(data);
}

/** Fetch a single vehicle by ID */
export async function fetchVehicleById(id: number): Promise<VehicleDto> {
  const { data } = await apiClient.get<VehicleDto>(`/api/products/vehicules/${id}`);
  return data;
}

/** Create a new vehicle */
export async function createVehicle(
  payload: CreateVehicleRequest
): Promise<VehicleDto> {
  const { data } = await apiClient.post<VehicleDto>(
    '/api/products/vehicules',
    payload
  );
  return data;
}

/** Update an existing vehicle */
export async function updateVehicle(
  id: number,
  payload: UpdateVehicleRequest
): Promise<VehicleDto> {
  const { data } = await apiClient.put<VehicleDto>(
    `/api/products/vehicules/${id}`,
    payload
  );
  return data;
}

/** Delete a vehicle */
export async function deleteVehicle(id: number): Promise<void> {
  await apiClient.delete(`/api/products/vehicules/${id}`);
}