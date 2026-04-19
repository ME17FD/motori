import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/catalogService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../types/category';
import type { PageableParams } from '../types/api';

export function useEquipementCategories(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.equipementCategories(params),
    queryFn: () => fetchCategoriesByType('EquipementCategory'),
  });
}

export function useEquipementCategoryMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['equipement-categories'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryRequest }) =>
      updateCategory(id, 'EquipementCategory', payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id, 'EquipementCategory'),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}