/**
 * Products Hook
 * Provides TanStack Query hooks for product queries and mutations.
 * Includes hooks for product list, single product detail, and CRUD operations.
 * Image upload mutation is included for product creation/update workflows.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProducts, fetchProduct,
  createProduct, updateProduct, deleteProduct,
  uploadProductImages,
} from '../services/productService';
import type { ProductFilters } from '../services/productService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { CreateProductRequest, UpdateProductRequest } from '../types/product';

/**
 * Fetch products with pagination, filtering, and sorting.
 * @param params - Product filters and pagination
 * @returns Query result with products array and metadata
 */
export function useProducts(params: ProductFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.products(params),
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: () => fetchProduct(id),
    enabled: id > 0,
  });
}

export function useProductMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['products'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateProductRequest) => createProduct(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductRequest }) =>
      updateProduct(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: invalidate,
  });

  const uploadImages = useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) =>
      uploadProductImages(id, files),
    onSuccess: invalidate,
  });

  return { create, update, remove, uploadImages };
}