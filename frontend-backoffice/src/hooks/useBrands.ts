/**
 * useBrands — unified TanStack Query hooks for all brand types.
 *
 * Replaces the three separate brand hook files (usePartBrands,
 * useEquipementBrands, useVehicleBrands) with a single parameterized hook.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchBrandsByType,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../services/catalogService';
import type { BrandType, CreateBrandRequest, UpdateBrandRequest } from '../types/brand';

// ─── Query keys ────────────────────────────────────────────────────────────

export const brandKeys = {
  all:     ['brands'] as const,
  byType:  (type: BrandType) => ['brands', type] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Fetch all brands of a given type */
export function useBrands(type: BrandType) {
  return useQuery({
    queryKey: brandKeys.byType(type),
    queryFn:  () => fetchBrandsByType(type),
    staleTime: 5 * 60 * 1000,
  });
}

/** Create a new brand */
export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBrandRequest) => createBrand(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.byType(created.type) });
      toast.success(`Brand "${created.name}" created.`);
    },
    onError: () => toast.error('Failed to create brand.'),
  });
}

/** Update an existing brand */
export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type, payload }: { id: string; type: BrandType; payload: UpdateBrandRequest }) =>
      updateBrand(id, type, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.byType(updated.type) });
      toast.success(`Brand "${updated.name}" updated.`);
    },
    onError: () => toast.error('Failed to update brand.'),
  });
}

/** Soft-delete a brand */
/** Soft-delete a brand — le type est nécessaire pour le path */
export function useDeleteBrand(type: BrandType) {
  const queryClient = useQueryClient();
  return useMutation({
    // ✅ Passe le type au service
    mutationFn: (id: string) => deleteBrand(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.byType(type) });
      toast.success('Brand deleted.');
    },
    onError: () => toast.error('Failed to delete brand.'),
  });
}