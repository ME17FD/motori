import type { Inventory } from './inventory';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DELIVERED'
  | 'CANCELLED';

/**
 * Maps to OrderItemResponse from product-service.
 * inventoryId is the Inventory object (not just a UUID).
 */
export interface OrderItem {
  id: string;
  inventoryId: Inventory;
  quantity: number;
  price: number;
}

/**
 * Maps to OrderResponse from product-service.
 */
export interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  completed: boolean;
  status: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTrackingRequest {
  trackingNumber?: string;
  status?: OrderStatus;
}