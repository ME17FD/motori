/**
 * Brands Hook
 * Provides TanStack Query hooks for brand queries and mutations.
 * Handles paginated brand list, full brand list (for selects), single brand, and CRUD.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBrands, fetchAllBrands, fetchBrand,
  createBrand, updateBrand, deleteBrand,
} from '../services/brandService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PageableParams } from '../types/api';
import type { CreateBrandRequest, UpdateBrandRequest } from '../types/brand';

/**
 * Paginated brands list.
 */
export function useBrands(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.brands(params),
    queryFn: () => fetchBrands(params),
  });
}

/**
 * Full brands list for select inputs — cached indefinitely (brands rarely change).
 */
export function useAllBrands() {
  return useQuery({
    queryKey: QUERY_KEYS.brandsAll(),
    queryFn: fetchAllBrands,
    staleTime: Infinity,
  });
}

/**
 * Single brand by id.
 */
export function useBrand(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.brand(id),
    queryFn: () => fetchBrand(id),
    enabled: id > 0,
  });
}

/**
 * Create, update and delete mutations.
 * Each invalidates the brands list on success.
 */
export function useBrandMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['brands'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateBrandRequest) => createBrand(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBrandRequest }) =>
      updateBrand(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}