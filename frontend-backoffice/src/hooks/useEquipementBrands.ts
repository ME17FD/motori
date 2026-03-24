import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEquipementBrands,
  fetchEquipementBrand,
  createEquipementBrand,
  updateEquipementBrand,
  deleteEquipementBrand,
} from '../services/equipementBrandService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PageableParams } from '../types/api';
import type { EquipementBrandRequest } from '../types/brand';

export function useEquipementBrands(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.equipementBrands(params),
    queryFn: () => fetchEquipementBrands(params),
  });
}

export function useEquipementBrand(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.equipementBrand(id),
    queryFn: () => fetchEquipementBrand(id),
    enabled: !!id,
  });
}

export function useEquipementBrandMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['equipement-brands'] });
  };

  const create = useMutation({
    mutationFn: (payload: EquipementBrandRequest) => createEquipementBrand(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EquipementBrandRequest }) =>
      updateEquipementBrand(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEquipementBrand(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}