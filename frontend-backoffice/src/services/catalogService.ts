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

// VehiculeBrand → /api/products/vehicule-brands
// PartBrand     → /api/products/part-brands
// EquipementBrand → /api/products/equipement-brands

export async function fetchBrandsByType(type: BrandType): Promise<BrandDto[]> {
  const pathMap: Record<BrandType, string> = {
    VehiculeBrand:   '/api/products/vehicule-brands',
    PartBrand:       '/api/products/part-brands',
    EquipementBrand: '/api/products/equipement-brands',
  };
  const { data } = await apiClient.get<BrandDto[]>(pathMap[type]);
  return data;
}

export async function createBrand(payload: CreateBrandRequest): Promise<BrandDto> {
  const pathMap: Record<BrandType, string> = {
    VehiculeBrand:   '/api/products/vehicule-brands',
    PartBrand:       '/api/products/part-brands',
    EquipementBrand: '/api/products/equipement-brands',
  };
  const { data } = await apiClient.post<BrandDto>(pathMap[payload.type], payload);
  return data;
}

export async function updateBrand(id: number, payload: UpdateBrandRequest & { type: BrandType }): Promise<BrandDto> {
  const pathMap: Record<BrandType, string> = {
    VehiculeBrand:   '/api/products/vehicule-brands',
    PartBrand:       '/api/products/part-brands',
    EquipementBrand: '/api/products/equipement-brands',
  };
  const { data } = await apiClient.put<BrandDto>(`${pathMap[payload.type]}/${id}`, payload);
  return data;
}

export async function deleteBrand(id: number, type: BrandType): Promise<void> {
  const pathMap: Record<BrandType, string> = {
    VehiculeBrand:   '/api/products/vehicule-brands',
    PartBrand:       '/api/products/part-brands',
    EquipementBrand: '/api/products/equipement-brands',
  };
  await apiClient.delete(`${pathMap[type]}/${id}`);
}

// ─── Categories ────────────────────────────────────────────────────────────

export async function fetchCategoriesByType(type: CategoryType): Promise<CategoryDto[]> {
  const pathMap: Record<CategoryType, string> = {
    PartCategory:       '/api/products/part-categories',
    EquipementCategory: '/api/products/equipement-categories',
  };
  const { data } = await apiClient.get<CategoryDto[]>(pathMap[type]);
  return data;
}

export async function fetchCategoryTree(type: CategoryType): Promise<CategoryDto[]> {
  const pathMap: Record<CategoryType, string> = {
    PartCategory:       '/api/products/part-categories',
    EquipementCategory: '/api/products/equipement-categories',
  };
  const { data } = await apiClient.get<CategoryDto[]>(`${pathMap[type]}/tree`);
  return data;
}

export async function createCategory(payload: CreateCategoryRequest): Promise<CategoryDto> {
  const pathMap: Record<CategoryType, string> = {
    PartCategory:       '/api/products/part-categories',
    EquipementCategory: '/api/products/equipement-categories',
  };
  const { data } = await apiClient.post<CategoryDto>(pathMap[payload.type], payload);
  return data;
}

export async function updateCategory(
  id: number,
  payload: UpdateCategoryRequest & { type: CategoryType }
): Promise<CategoryDto> {
  const pathMap: Record<CategoryType, string> = {
    PartCategory:       '/api/products/part-categories',
    EquipementCategory: '/api/products/equipement-categories',
  };
  const { data } = await apiClient.put<CategoryDto>(
    `${pathMap[payload.type]}/${id}`,
    payload
  );
  return data;
}

export async function deleteCategory(id: number, type: CategoryType): Promise<void> {
  const pathMap: Record<CategoryType, string> = {
    PartCategory:       '/api/products/part-categories',
    EquipementCategory: '/api/products/equipement-categories',
  };
  await apiClient.delete(`${pathMap[type]}/${id}`);
}

// ─── Vehicles ──────────────────────────────────────────────────────────────

export async function fetchVehicles(brandId?: number): Promise<VehicleDto[]> {
  const { data } = await apiClient.get<VehicleDto[]>('/api/products/vehicules', {
    params: brandId ? { brandId } : undefined,
  });
  return data;
}

export async function createVehicle(payload: CreateVehicleRequest): Promise<VehicleDto> {
  const { data } = await apiClient.post<VehicleDto>('/api/products/vehicules', payload);
  return data;
}

export async function updateVehicle(id: number, payload: UpdateVehicleRequest): Promise<VehicleDto> {
  const { data } = await apiClient.put<VehicleDto>(`/api/products/vehicules/${id}`, payload);
  return data;
}

export async function deleteVehicle(id: number): Promise<void> {
  await apiClient.delete(`/api/products/vehicules/${id}`);
}