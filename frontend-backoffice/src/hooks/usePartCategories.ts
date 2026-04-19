import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategoriesByType,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/catalogService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PageableParams } from '../types/api';
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../types/category';

export function usePartCategories(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.partCategories(params),
    queryFn: () => fetchCategoriesByType('PartCategory'),
  });
}

export function usePartCategory(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.partCategory(id),
    queryFn: () => fetchCategoryById(id),
    enabled: !!id,
  });
}

export function usePartCategoryMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['part-categories'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryRequest }) =>
      updateCategory(id, 'PartCategory', payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id, 'PartCategory'),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}