import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEquipementCategories,
  createEquipementCategory,
  updateEquipementCategory,
  deleteEquipementCategory,
} from '../services/equipementCategoryService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { EquipementCategoryRequest } from '../types/category';
import type { PageableParams } from '../types/api';

export function useEquipementCategories(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.equipementCategories(params),
    queryFn: () => fetchEquipementCategories(params),
  });
}

export function useEquipementCategoryMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['equipement-categories'] });
  };

  const create = useMutation({
    mutationFn: (payload: EquipementCategoryRequest) => createEquipementCategory(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EquipementCategoryRequest }) =>
      updateEquipementCategory(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEquipementCategory(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}