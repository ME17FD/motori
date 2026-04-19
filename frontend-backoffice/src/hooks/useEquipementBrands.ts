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

export function useEquipementBrands(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.equipementBrands(params),
    queryFn: () => fetchBrandsByType('EquipementBrand'),
  });
}

export function useEquipementBrand(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.equipementBrand(id),
    queryFn: () => fetchBrandById(id, 'EquipementBrand'),
    enabled: !!id,
  });
}

export function useEquipementBrandMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['equipement-brands'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateBrandRequest) => createBrand(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBrandRequest }) =>
      updateBrand(id, 'EquipementBrand', payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteBrand(id, 'EquipementBrand'),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}