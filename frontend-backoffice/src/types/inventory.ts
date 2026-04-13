import type { Part, Equipement } from './product';

/**
 * Inventory item — maps to InventoryResponse from product-service.
 *
 * Each inventory item represents ONE physical unit.
 * Exactly one of part or equipement will be populated — never both.
 *
 * paymentStatus tracks whether this unit has been paid for:
 * - null / undefined = available for purchase
 * - "PENDING"        = in an active order, payment pending
 * - "PAID"           = sold and paid
 */
export interface Inventory {
  id: string;
  part?: Part;
  equipement?: Equipement;
  expiredAt?: string;       // ISO datetime — null means no expiry
  soldAt?: string;          // ISO datetime — null means not yet sold
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request body for creating an inventory entry.
 * Provide exactly one of partId or equipementId.
 */
export interface InventoryRequest {
  partId?: string;
  equipementId?: string;
  expiredAt?: string;       // ISO datetime
}

/**
 * Filters for the inventory list endpoint.
 * Index signature required for TanStack Query key compatibility.
 */
export interface InventoryFilters {
  page?: number;
  size?: number;
  available?: boolean;
  paymentStatus?: string;
  type?: string;            // "PART" or "EQUIPMENT"
  [key: string]: unknown;
}