/**
 * useCategories — TanStack Query hooks for category endpoints.
 */

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

// ─── Query keys ────────────────────────────────────────────────────────────

export const categoryKeys = {
  all:    ['categories'] as const,
  byType: (type: CategoryType) => ['categories', 'list', type] as const,
  tree:   (type: CategoryType) => ['categories', 'tree', type] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Flat list of categories by type */
export function useCategories(type: CategoryType) {
  return useQuery({
    queryKey: categoryKeys.byType(type),
    queryFn:  () => fetchCategoriesByType(type),
    staleTime: 5 * 60 * 1000,
  });
}

/** Nested tree of categories by type */
export function useCategoryTree(type: CategoryType) {
  return useQuery({
    queryKey: categoryKeys.tree(type),
    queryFn:  () => fetchCategoryTree(type),
    staleTime: 5 * 60 * 1000,
  });
}

/** Create a new category */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.byType(created.type),
      });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.tree(created.type),
      });
      toast.success(`Category "${created.name}" created.`);
    },
    onError: () => toast.error('Failed to create category.'),
  });
}

/** Update an existing category */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCategoryRequest }) =>
      updateCategory(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.byType(updated.type) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree(updated.type) });
      toast.success(`Category "${updated.name}" updated.`);
    },
    onError: () => toast.error('Failed to update category.'),
  });
}

/** Delete a category */
export function useDeleteCategory(type: CategoryType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.byType(type) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree(type) });
      toast.success('Category deleted.');
    },
    onError: () => toast.error('Failed to delete category.'),
  });
}