import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories, fetchAllCategories, fetchCategory,
  createCategory, updateCategory, deleteCategory,
} from '../services/categoryService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PageableParams } from '../types/api';
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../types/category';

export function useCategories(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.categories(params),
    queryFn: () => fetchCategories(params),
  });
}

export function useAllCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categoriesAll(),
    queryFn: fetchAllCategories,
    staleTime: Infinity,
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.category(id),
    queryFn: () => fetchCategory(id),
    enabled: id > 0,
  });
}

export function useCategoryMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['categories'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCategoryRequest }) =>
      updateCategory(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}