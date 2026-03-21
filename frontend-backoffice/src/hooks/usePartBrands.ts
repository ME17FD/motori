import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPartBrands,
  fetchPartBrand,
  createPartBrand,
  updatePartBrand,
  deletePartBrand,
} from '../services/partBrandService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PageableParams } from '../types/api';
import type { PartBrandRequest } from '../types/brand';

/**
 * Paginated part brands list.
 */
export function usePartBrands(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.partBrands(params),
    queryFn: () => fetchPartBrands(params),
  });
}

/**
 * Single part brand by UUID.
 */
export function usePartBrand(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.partBrand(id),
    queryFn: () => fetchPartBrand(id),
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
    mutationFn: (payload: PartBrandRequest) => createPartBrand(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PartBrandRequest }) =>
      updatePartBrand(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePartBrand(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}