/**
 * Promotion types — mirrors product-service promotion schemas.
 */

export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface PromotionDto {
  id: number;
  name: string;
  description?: string;
  type: PromotionType;
  /** Percentage (0–100) or fixed MAD amount */
  value: number;
  code?: string;
  /** ISO date string */
  startDate: string;
  /** ISO date string */
  endDate: string;
  active: boolean;
  /** IDs of products this promotion applies to */
  productIds?: number[];
}

export interface CreatePromotionRequest {
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  code?: string;
  startDate: string;
  endDate: string;
  productIds?: number[];
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {}