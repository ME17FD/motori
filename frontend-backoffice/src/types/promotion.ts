/**
 * Discount type — percentage or fixed amount.
 */
export type DiscountType = 'PERCENTAGE' | 'FIXED';

/**
 * Promotion entity.
 */
export interface Promotion {
  id: number;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;       // percentage (0-100) or fixed amount
  minOrderAmount?: number;     // minimum order to apply promo
  maxUses?: number;            // null = unlimited
  usedCount: number;
  active: boolean;
  startDate?: string;          // ISO date
  endDate?: string;            // ISO date
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
 * Filters for promotions list.
 */
export interface PromotionFilters {
  page?: number;
  size?: number;
  active?: boolean;
  search?: string;
  [key: string]: unknown;
}