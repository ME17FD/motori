/**
 * Discount calculation method.
 */
export type DiscountType = 'PERCENTAGE' | 'FIXED';

/**
 * Promotion entity — to be wired when promotion endpoints are available.
 */
export interface Promotion {
  id: number;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionRequest {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  active?: boolean;
  startDate?: string;
  endDate?: string;
}

export type UpdatePromotionRequest = Partial<CreatePromotionRequest>;

/**
 * Filters for the promotions list.
 * Index signature required for TanStack Query key compatibility.
 */
export interface PromotionFilters {
  page?: number;
  size?: number;
  active?: boolean;
  search?: string;
  [key: string]: unknown;
}