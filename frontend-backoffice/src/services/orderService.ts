import axiosInstance from '../api/axiosInstance';
import type { Order, OrderStatus, UpdateTrackingRequest } from '../types/order';
import type { PageResponse, PageableParams } from '../types/api';

export interface OrderFilters extends PageableParams {
  trackingNumber?: string;
  status?: OrderStatus;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * GET /api/orders — paginated list.
 */
export async function fetchOrders(params: OrderFilters = {}): Promise<PageResponse<Order>> {
  const { data } = await axiosInstance.get<PageResponse<Order>>('/api/orders', {
    params: {
      page: params.page,
      size: params.size,
      sort: params.sort,
    },
  });
  return data;
}

/**
 * GET /api/orders/search — filtered search.
 */
export async function searchOrders(params: OrderFilters = {}): Promise<PageResponse<Order>> {
  const { data } = await axiosInstance.get<PageResponse<Order>>('/api/orders/search', {
    params: {
      arg0: params.trackingNumber,
      arg1: params.status,
      arg2: params.userId,
      arg3: params.startDate,
      arg4: params.endDate,
      page: params.page,
      size: params.size,
      sort: params.sort,
    },
  });
  return data;
}

/**
 * GET /api/orders/:id
 */
export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await axiosInstance.get<Order>(`/api/orders/${id}`);
  return data;
}

/**
 * GET /api/orders/recent
 */
export async function fetchRecentOrders(limit = 10): Promise<Order[]> {
  const { data } = await axiosInstance.get<Order[]>('/api/orders/recent', {
    params: { arg0: limit },
  });
  return data;
}

/**
 * GET /api/orders/status/:status
 */
export async function fetchOrdersByStatus(
  status: OrderStatus,
  params: PageableParams = {},
): Promise<PageResponse<Order>> {
  const { data } = await axiosInstance.get<PageResponse<Order>>(
    `/api/orders/status/${status}`,
    { params },
  );
  return data;
}

/**
 * GET /api/orders/user/:userId
 */
export async function fetchOrdersByUser(
  userId: number,
  params: PageableParams = {},
): Promise<PageResponse<Order>> {
  const { data } = await axiosInstance.get<PageResponse<Order>>(
    `/api/orders/user/${userId}`,
    { params: { arg1: params } },
  );
  return data;
}

/**
 * PATCH /api/orders/:id/status
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const { data } = await axiosInstance.patch<Order>(
    `/api/orders/${id}/status`,
    null,
    { params: { arg1: status } },
  );
  return data;
}

/**
 * PATCH /api/orders/:id/tracking
 */
export async function updateOrderTracking(
  id: string,
  payload: UpdateTrackingRequest,
): Promise<Order> {
  const { data } = await axiosInstance.patch<Order>(
    `/api/orders/${id}/tracking`,
    payload,
  );
  return data;
}

/**
 * GET /api/orders/export
 * Returns raw blob for CSV or JSON download.
 */
export async function exportOrders(params: {
  format?: 'csv' | 'json';
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  const { data } = await axiosInstance.get('/api/orders/export', {
    params: {
      arg0: params.format ?? 'csv',
      arg1: params.status,
      arg2: params.startDate,
      arg3: params.endDate,
    },
    responseType: 'blob',
  });
  return data;
}