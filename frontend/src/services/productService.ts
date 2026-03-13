import axiosInstance from '../api/axiosInstance';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types/product';
import type { PageResponse, PageableParams } from '../types/api';

const BASE = '/api/products';

export interface ProductFilters extends PageableParams {
  search?: string;
  brandId?: number;
  categoryId?: number;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * GET /api/products — paginated + filtered list.
 */
export async function fetchProducts(params: ProductFilters = {}): Promise<PageResponse<Product>> {
  const { data } = await axiosInstance.get<PageResponse<Product>>(BASE, { params });
  return data;
}

/**
 * GET /api/products/:id
 */
export async function fetchProduct(id: number): Promise<Product> {
  const { data } = await axiosInstance.get<Product>(`${BASE}/${id}`);
  return data;
}

/**
 * POST /api/products
 */
export async function createProduct(payload: CreateProductRequest): Promise<Product> {
  const { data } = await axiosInstance.post<Product>(BASE, payload);
  return data;
}

/**
 * PUT /api/products/:id
 */
export async function updateProduct(id: number, payload: UpdateProductRequest): Promise<Product> {
  const { data } = await axiosInstance.put<Product>(`${BASE}/${id}`, payload);
  return data;
}

/**
 * DELETE /api/products/:id
 */
export async function deleteProduct(id: number): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}

/**
 * POST /api/products/:id/images
 * Uploads images to Minio via multipart form.
 */
export async function uploadProductImages(id: number, files: File[]): Promise<Product> {
  const form = new FormData();
  files.forEach((file) => form.append('images', file));
  const { data } = await axiosInstance.post<Product>(`${BASE}/${id}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * DELETE /api/products/:id/images/:imageUrl
 */
export async function deleteProductImage(id: number, imageUrl: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}/images`, { params: { imageUrl } });
}