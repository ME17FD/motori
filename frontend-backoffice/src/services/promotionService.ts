/**
 * Promotion service — CRUD for promotions.
 * Base path: /api/promotions (through API Gateway)
 */

import apiClient from '../api/axiosInstance';
import type {
  PromotionDto,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from '../types/promotion';
import type { PageResult } from '../types/product';

/** Fetch paginated promotions */
export async function fetchPromotions(
  page = 0,
  size = 20
): Promise<PageResult<PromotionDto>> {
  const { data } = await apiClient.get<PageResult<PromotionDto>>(
    '/api/promotions',
    { params: { page, size } }
  );
  return data;
}

/** Fetch a single promotion by ID */
export async function fetchPromotionById(id: number): Promise<PromotionDto> {
  const { data } = await apiClient.get<PromotionDto>(`/api/promotions/${id}`);
  return data;
}

/** Create a promotion */
export async function createPromotion(
  payload: CreatePromotionRequest
): Promise<PromotionDto> {
  const { data } = await apiClient.post<PromotionDto>(
    '/api/promotions',
    payload
  );
  return data;
}

/** Update a promotion */
export async function updatePromotion(
  id: number,
  payload: UpdatePromotionRequest
): Promise<PromotionDto> {
  const { data } = await apiClient.put<PromotionDto>(
    `/api/promotions/${id}`,
    payload
  );
  return data;
}

/** Delete a promotion */
export async function deletePromotion(id: number): Promise<void> {
  await apiClient.delete(`/api/promotions/${id}`);
}

/** Generate a random promo code */
export function generatePromoCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');
}