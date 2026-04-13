/**
 * useEquipements — TanStack Query hooks for equipement endpoints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchEquipements,
  fetchEquipementById,
  createEquipement,
  updateEquipement,
  deleteEquipement,
} from '../services/equipementService';
import type {
  ProductFilters,
  CreateEquipementRequest,
  UpdateEquipementRequest,
} from '../types/product';

// ─── Query keys ────────────────────────────────────────────────────────────

export const equipementKeys = {
  all:     ['equipements'] as const,
  lists:   () => [...equipementKeys.all, 'list'] as const,
  list:    (f: ProductFilters) => [...equipementKeys.lists(), f] as const,
  details: () => [...equipementKeys.all, 'detail'] as const,
  detail:  (id: number) => [...equipementKeys.details(), id] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Paginated + filtered equipements list */
export function useEquipements(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: equipementKeys.list(filters),
    queryFn:  () => fetchEquipements(filters),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** Single equipement by ID */
export function useEquipement(id: number | null) {
  return useQuery({
    queryKey: equipementKeys.detail(id ?? 0),
    queryFn:  () => fetchEquipementById(id!),
    enabled:  id !== null,
    staleTime: 2 * 60 * 1000,
  });
}

/** Create an equipement */
export function useCreateEquipement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEquipementRequest) => createEquipement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipementKeys.lists() });
      toast.success('Equipment created successfully.');
    },
    onError: () => toast.error('Failed to create equipment.'),
  });
}

/** Update an equipement */
export function useUpdateEquipement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateEquipementRequest;
    }) => updateEquipement(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: equipementKeys.lists() });
      queryClient.setQueryData(equipementKeys.detail(updated.id), updated);
      toast.success('Equipment updated successfully.');
    },
    onError: () => toast.error('Failed to update equipment.'),
  });
}

/** Delete an equipement */
export function useDeleteEquipement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEquipement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipementKeys.lists() });
      toast.success('Equipment deleted.');
    },
    onError: () => toast.error('Failed to delete equipment.'),
  });
}