/**
 * Inventory status for a product.
 */
export type InventoryStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

/**
 * Inventory entry — maps to the inventory resource from product-service.
 */
export interface Inventory {
  id: number;
  productId: number;
  productName?: string;
  productType?: string;
  brandName?: string;
  quantity: number;
  available: boolean;
  status: InventoryStatus;
  lowStockThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request body for updating inventory.
 */
export interface UpdateInventoryRequest {
  quantity?: number;
  available?: boolean;
  status?: InventoryStatus;
  lowStockThreshold?: number;
}

/**
 * Filters for inventory list queries.
 */
export interface InventoryFilters {
  page?: number;
  size?: number;
  productType?: string;
  available?: boolean;
  status?: InventoryStatus;
  search?: string;
  lowStock?: boolean;
  [key: string]: unknown;
}