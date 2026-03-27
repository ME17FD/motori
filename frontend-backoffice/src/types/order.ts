/**
 * Order types — mirrors the backoffice-service OpenAPI schemas.
 */

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  productName?: string;
}

export interface OrderDto {
  id: string;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItemDto[];
}

export interface PageOrderDto {
  content: OrderDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}