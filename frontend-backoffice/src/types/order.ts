/**
 * Order Types & Interfaces
 * Defines the complete order data model including status lifecycle,
 * line items, and operations (tracking updates).
 */

/**
 * Order lifecycle status enumeration.
 * PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
 * Can transition to CANCELLED from any state.
 */
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  productName?: string;
}

export interface Order {
  id: string;        // UUID — string, not number
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface UpdateTrackingRequest {
  trackingNumber?: string;
  status?: OrderStatus;
}