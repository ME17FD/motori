/**
 * Order status values from product-service.
 */
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

/**
 * Order item — maps to OrderItemResponse from product-service.
 * Each item references an inventory entry with its part or equipment.
 */
export interface OrderItem {
  id: string;
  inventory: {
    id: string;
    part?: { id: string; name: string; price: number; imageUrl?: string };
    equipement?: { id: string; name: string; price: number; imageUrl?: string };
    paymentStatus?: string;
  };
  price: number;
}

/**
 * Order — maps to OrderResponse from product-service.
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