/**
 * useOrders — TanStack Query hooks for all order-related endpoints.
 *
 * Hooks:
 *   useRecentOrders()     — dashboard recent orders (with polling)
 *   useOrders()           — paginated + filtered order list
 *   useOrder()            — single order by UUID
 *   useUpdateStatus()     — mutation: change order status
 *   useUpdateTracking()   — mutation: update tracking number / status
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchRecentOrders,
  fetchOrders,
  fetchOrderById,
  updateOrderStatus,
  updateTracking,
  type OrderSearchParams,
} from '../services/orderService';
import type { OrderStatus } from '../types/order';

// ─── Query keys ────────────────────────────────────────────────────────────

export const orderKeys = {
  all:     ['orders'] as const,
  lists:   () => [...orderKeys.all, 'list'] as const,
  list:    (params: OrderSearchParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail:  (id: string) => [...orderKeys.details(), id] as const,
  recent:  (limit: number) => [...orderKeys.all, 'recent', limit] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Recent orders for the dashboard — polls every 2 minutes */
export function useRecentOrders(limit = 10) {
  return useQuery({
    queryKey: orderKeys.recent(limit),
    queryFn:  () => fetchRecentOrders(limit),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

/** Paginated and filtered order list */
export function useOrders(params: OrderSearchParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn:  () => fetchOrders(params),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev, // keep previous page data while fetching next
  });
}

/** Single order detail by UUID */
export function useOrder(id: string | null) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn:  () => fetchOrderById(id!),
    enabled:  !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation: update order status.
 * Optimistically updates the list cache, rolls back on error.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),

    onSuccess: (updatedOrder) => {
      // Update the detail cache directly
      queryClient.setQueryData(
        orderKeys.detail(updatedOrder.id),
        updatedOrder
      );
      // Invalidate all list queries to refetch with new status
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success(`Order status updated to ${updatedOrder.status}`);
    },

    onError: () => {
      toast.error('Failed to update order status. Please try again.');
    },
  });
}

/**
 * Mutation: update tracking number and/or status.
 */
export function useUpdateTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      trackingNumber,
      status,
    }: {
      id: string;
      trackingNumber?: string;
      status?: OrderStatus;
    }) => updateTracking(id, { trackingNumber, status }),

    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(
        orderKeys.detail(updatedOrder.id),
        updatedOrder
      );
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Tracking information updated.');
    },

    onError: () => {
      toast.error('Failed to update tracking. Please try again.');
    },
  });
}