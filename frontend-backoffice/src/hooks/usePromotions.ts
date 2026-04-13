/**
 * usePromotions — TanStack Query hooks for promotions.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../services/promotionService';
import type {
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from '../types/promotion';

// ─── Query keys ────────────────────────────────────────────────────────────

export const promotionKeys = {
  all:   ['promotions'] as const,
  lists: () => [...promotionKeys.all, 'list'] as const,
  list:  (page: number) => [...promotionKeys.lists(), page] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Paginated promotions */
export function usePromotions(page = 0) {
  return useQuery({
    queryKey: promotionKeys.list(page),
    queryFn:  () => fetchPromotions(page),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** Create a promotion */
export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePromotionRequest) => createPromotion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      toast.success('Promotion created.');
    },
    onError: () => toast.error('Failed to create promotion.'),
  });
}

/** Update a promotion */
export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdatePromotionRequest;
    }) => updatePromotion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      toast.success('Promotion updated.');
    },
    onError: () => toast.error('Failed to update promotion.'),
  });
}

/** Delete a promotion */
export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      toast.success('Promotion deleted.');
    },
    onError: () => toast.error('Failed to delete promotion.'),
  });
}