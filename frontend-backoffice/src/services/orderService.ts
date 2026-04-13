import axiosInstance from '../api/axiosInstance';
import type { Order, OrderStatus, UpdateTrackingRequest } from '../types/order';
import type { PagedModel } from '../types/api';

/**
 * Orders are managed by product-service.
 * Gateway route: /api/products/orders/** → /api/orders/** on product-service.
 */

export interface OrderFilters {
  status?: string;
  completed?: boolean;
  userId?: string;
  page?: number;
  size?: number;
  [key: string]: unknown;
}

/**
 * GET /api/products/orders — paginated list.
 * Supports optional status and completed filters.
 */
export async function fetchOrders(
  params: OrderFilters = {},
): Promise<PagedModel<Order>> {
  const { data } = await axiosInstance.get<PagedModel<Order>>(
    '/api/products/orders',
    { params },
  );
  return data;
}

/**
 * GET /api/products/orders/:id
 */
export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await axiosInstance.get<Order>(`/api/products/orders/${id}`);
  return data;
}

/**
 * GET /api/products/orders/user/:userId
 */
export async function fetchRecentOrders(limit = 10): Promise<Order[]> {
  const { data } = await axiosInstance.get<PagedModel<Order>>(
    '/api/products/orders',
    { params: { size: limit, page: 0 } },
  );
  return data.content;
}

/**
 * DELETE /api/products/orders/:id
 */
export async function deleteOrder(id: string): Promise<void> {
  await axiosInstance.delete(`/api/products/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const { data } = await axiosInstance.patch<Order>(
    `/api/products/orders/${id}/status`,
    null,
    { params: { status } },
  );
  return data;
}

export async function updateOrderTracking(
  id: string,
  payload: UpdateTrackingRequest,
): Promise<Order> {
  const { data } = await axiosInstance.patch<Order>(
    `/api/products/orders/${id}/tracking`,
    payload,
  );
  return data;
}