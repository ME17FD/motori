export type OrderStatus =
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