/**
 * useParts — TanStack Query hooks for part endpoints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchParts,
  fetchPartById,
  createPart,
  updatePart,
  deletePart,
} from '../services/partService';
import type {
  ProductFilters,
  CreatePartRequest,
  UpdatePartRequest,
} from '../types/product';

// ─── Query keys ────────────────────────────────────────────────────────────

export const partKeys = {
  all:     ['parts'] as const,
  lists:   () => [...partKeys.all, 'list'] as const,
  list:    (f: ProductFilters) => [...partKeys.lists(), f] as const,
  details: () => [...partKeys.all, 'detail'] as const,
  detail:  (id: number) => [...partKeys.details(), id] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Paginated + filtered parts list */
export function useParts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: partKeys.list(filters),
    queryFn:  () => fetchParts(filters),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** Single part by ID */
export function usePart(id: number | null) {
  return useQuery({
    queryKey: partKeys.detail(id ?? 0),
    queryFn:  () => fetchPartById(id!),
    enabled:  id !== null,
    staleTime: 2 * 60 * 1000,
  });
}

/** Create a part */
export function useCreatePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePartRequest) => createPart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.lists() });
      toast.success('Part created successfully.');
    },
    onError: () => toast.error('Failed to create part.'),
  });
}

/** Update a part */
export function useUpdatePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePartRequest }) =>
      updatePart(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: partKeys.lists() });
      queryClient.setQueryData(partKeys.detail(updated.id), updated);
      toast.success('Part updated successfully.');
    },
    onError: () => toast.error('Failed to update part.'),
  });
}

/** Delete a part */
export function useDeletePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.lists() });
      toast.success('Part deleted.');
    },
    onError: () => toast.error('Failed to delete part.'),
  });
}