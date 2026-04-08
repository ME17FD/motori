import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchCategoriesByType,
  fetchCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/catalogService';
import type {
  CategoryType,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category';

export const categoryKeys = {
  all:    ['categories'] as const,
  byType: (type: CategoryType) => ['categories', 'list', type] as const,
  tree:   (type: CategoryType) => ['categories', 'tree', type] as const,
};

export function useCategories(type: CategoryType) {
  return useQuery({
    queryKey: categoryKeys.byType(type),
    queryFn:  () => fetchCategoriesByType(type),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryTree(type: CategoryType) {
  return useQuery({
    queryKey: categoryKeys.tree(type),
    queryFn:  () => fetchCategoryTree(type),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(payload),
    onSuccess: (created, { type }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.byType(type) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree(type) });
      toast.success(`Category "${created.name}" created.`);
    },
    onError: () => toast.error('Failed to create category.'),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type, payload }: { id: string; type: CategoryType; payload: UpdateCategoryRequest }) =>
      updateCategory(id, type, payload),
    onSuccess: (updated, { type }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.byType(type) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree(type) });
      toast.success(`Category "${updated.name}" updated.`);
    },
    onError: () => toast.error('Failed to update category.'),
  });
}

export function useDeleteCategory(type: CategoryType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.byType(type) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree(type) });
      toast.success('Category deleted.');
    },
    onError: () => toast.error('Failed to delete category.'),
  });
}