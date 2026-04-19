/**
 * Order service — all backoffice-service order endpoints.
 *
 * Base path: /api/orders (through API Gateway on port 8085)
 *
 * Endpoints covered:
 *   GET  /api/orders                    — paginated list
 *   GET  /api/orders/recent             — recent N orders
 *   GET  /api/orders/search             — filtered search
 *   GET  /api/orders/:id                — single order
 *   GET  /api/orders/status/:status     — filter by status
 *   GET  /api/orders/export             — CSV/JSON export
 *   PATCH /api/orders/:id/status        — change status
 *   PATCH /api/orders/:id/tracking      — update tracking
 */

import apiClient from '../api/axiosInstance';
import type { OrderDto, PageOrderDto, OrderStatus } from '../types/order';

// ─── Param types ───────────────────────────────────────────────────────────

export interface OrderSearchParams {
  /** Tracking number substring search */
  trackingNumber?: string;
  status?: OrderStatus;
  userId?: number;
  /** ISO date yyyy-MM-dd */
  from?: string;
  /** ISO date yyyy-MM-dd */
  to?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface ExportParams {
  format?: 'csv' | 'json';
  status?: OrderStatus;
  from?: string;
  to?: string;
}

// ─── Queries ───────────────────────────────────────────────────────────────

/** Fetch recent N orders for the dashboard */
export async function fetchRecentOrders(limit = 10): Promise<OrderDto[]> {
  const { data } = await apiClient.get<OrderDto[]>('/api/orders/recent', {
    params: { limit }, // ✅ already correct
  });
  return data;
}

/**
 * Fetch paginated orders.
 * When search params are present, uses /api/orders/search for richer filtering.
 * Falls back to /api/orders for simple pagination.
 */
export async function fetchOrders(
  params: OrderSearchParams = {}
): Promise<PageOrderDto> {
  const hasFilters =
    params.trackingNumber || params.status || params.userId ||
    params.from || params.to;

  if (hasFilters) {
    const { data } = await apiClient.get<PageOrderDto>('/api/orders/search', {
      params: {
        trackingNumber: params.trackingNumber, // ✅ fixed
        status: params.status,                 // ✅ fixed
        userId: params.userId,                 // ✅ fixed
        fromDate: params.from,                 // ✅ fixed (backend expects fromDate)
        toDate: params.to,                     // ✅ fixed (backend expects toDate)
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort,
      },
    });
    return data;
  }

  const { data } = await apiClient.get<PageOrderDto>('/api/orders', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort,
    },
  });
  return data;
}

/** Fetch a single order by UUID */
export async function fetchOrderById(id: string): Promise<OrderDto> {
  const { data } = await apiClient.get<OrderDto>(`/api/orders/${id}`);
  return data;
}

/** Update an order's status */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderDto> {
  const { data } = await apiClient.patch<OrderDto>(
    `/api/orders/${id}/status`,
    null,
    { params: { status } } // ✅ fixed (was arg1)
  );
  return data;
}

/** Update tracking number and/or status */
export async function updateTracking(
  id: string,
  payload: { trackingNumber?: string; status?: OrderStatus }
): Promise<OrderDto> {
  const { data } = await apiClient.patch<OrderDto>(
    `/api/orders/${id}/tracking`,
    payload
  );
  return data;
}

/**
 * Trigger an export download (CSV or JSON).
 * Returns a Blob that the caller converts to a file download.
 */
export async function exportOrders(params: ExportParams = {}): Promise<Blob> {
  const { data } = await apiClient.get<Blob>('/api/orders/export', {
    params: {
      format: params.format ?? 'csv', // ✅ fixed
      status: params.status,          // ✅ fixed
      fromDate: params.from,          // ✅ fixed (backend expects fromDate)
      toDate: params.to,              // ✅ fixed (backend expects toDate)
    },
    responseType: 'blob',
  });
  return data;
}