import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBrandsByType,
  fetchBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../services/catalogService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PageableParams } from '../types/api';
import type { CreateBrandRequest, UpdateBrandRequest } from '../types/brand';

/**
 * Paginated part brands list.
 */
export function usePartBrands(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.partBrands(params),
    queryFn: () => fetchBrandsByType('PartBrand'),
  });
}

/**
 * Single part brand by UUID.
 */
export function usePartBrand(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.partBrand(id),
    queryFn: () => fetchBrandById(id, 'PartBrand'),
    enabled: !!id,
  });
}

/**
 * Create, update and delete mutations for part brands.
 */
export function usePartBrandMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['part-brands'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateBrandRequest) => createBrand(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBrandRequest }) =>
      updateBrand(id, 'PartBrand', payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteBrand(id, 'PartBrand'),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}