import axiosInstance from '../api/axiosInstance';
import type {
  Promotion,
  PromotionFilters,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from '../types/promotion';
import type { PageResponse } from '../types/api';

const BASE = '/api/promotions';

/**
 * GET /api/promotions — paginated list.
 */
export async function fetchPromotions(
  params: PromotionFilters = {},
): Promise<PageResponse<Promotion>> {
  const { data } = await axiosInstance.get<PageResponse<Promotion>>(BASE, { params });
  return data;
}

/**
 * GET /api/promotions/:id
 */
export async function fetchPromotion(id: number): Promise<Promotion> {
  const { data } = await axiosInstance.get<Promotion>(`${BASE}/${id}`);
  return data;
}

/**
 * POST /api/promotions
 */
export async function createPromotion(
  payload: CreatePromotionRequest,
): Promise<Promotion> {
  const { data } = await axiosInstance.post<Promotion>(BASE, payload);
  return data;
}

/**
 * PUT /api/promotions/:id
 */
export async function updatePromotion(
  id: number,
  payload: UpdatePromotionRequest,
): Promise<Promotion> {
  const { data } = await axiosInstance.put<Promotion>(`${BASE}/${id}`, payload);
  return data;
}

/**
 * DELETE /api/promotions/:id
 */
export async function deletePromotion(id: number): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}

/**
 * PATCH /api/promotions/:id/toggle
 * Toggles the active state of a promotion.
 */
export async function togglePromotion(id: number): Promise<Promotion> {
  const { data } = await axiosInstance.patch<Promotion>(`${BASE}/${id}/toggle`);
  return data;
}