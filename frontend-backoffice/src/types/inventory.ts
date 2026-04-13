/**
 * Inventory types — mirrors product-service inventory schemas.
 *
 * An inventory item represents a single stock unit of a product.
 * Items can be sold (soldAt populated) or available (soldAt null).
 */

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type InventoryItemType = 'PART' | 'EQUIPEMENT';

export interface InventoryItemDto {
  id: number;
  productId: string;
  productName?: string;
  type: InventoryItemType;
  paymentStatus: PaymentStatus;
  /** ISO date — null means item is still available */
  soldAt?: string | null;
  /** ISO date — expiry date for perishable parts */
  expiresAt?: string | null;
  createdAt: string;
}

export interface CreateInventoryRequest {
  partId?: string;       // for PART type
  equipementId?: string;
  type: InventoryItemType;
  quantity: number;
  expiresAt?: string;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: PaymentStatus;
}

export interface InventoryFilters {
  type?: InventoryItemType;
  paymentStatus?: PaymentStatus;
  /** true = only available (soldAt null), false = only sold */
  available?: boolean;
  productName?: string;
  page?: number;
  size?: number;
}

/** Aggregated stock summary per product */
export interface StockSummary {
  productId: number;
  productName: string;
  type: InventoryItemType;
  totalStock: number;
  availableStock: number;
  soldStock: number;
}