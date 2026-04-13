import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPartCategories,
  fetchPartCategory,
  createPartCategory,
  updatePartCategory,
  deletePartCategory,
} from '../services/partCategoryService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PageableParams } from '../types/api';
import type { PartCategoryRequest } from '../types/category';

export function usePartCategories(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.partCategories(params),
    queryFn: () => fetchPartCategories(params),
  });
}

export function usePartCategory(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.partCategory(id),
    queryFn: () => fetchPartCategory(id),
    enabled: !!id,
  });
}

export function usePartCategoryMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['part-categories'] });
  };

  const create = useMutation({
    mutationFn: (payload: PartCategoryRequest) => createPartCategory(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PartCategoryRequest }) =>
      updatePartCategory(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePartCategory(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}