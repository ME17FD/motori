/**
 * Promotions Hook
 * Provides TanStack Query hooks for promotion/discount management.
 * Includes queries for paginated list and mutations for create, update, delete, and toggle.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
} from '../services/promotionService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PromotionFilters, CreatePromotionRequest, UpdatePromotionRequest } from '../types/promotion';

/**
 * Fetch promotions with pagination and filtering.
 * @param params - Promotion filters and pagination
 * @returns Query result with promotions array and metadata
 */
export function usePromotions(params: PromotionFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.promotions(params),
    queryFn: () => fetchPromotions(params),
  });
}

export function usePromotionMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['promotions'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreatePromotionRequest) => createPromotion(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePromotionRequest }) =>
      updatePromotion(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deletePromotion(id),
    onSuccess: invalidate,
  });

  const toggle = useMutation({
    mutationFn: (id: number) => togglePromotion(id),
    onSuccess: invalidate,
  });

  return { create, update, remove, toggle };
}