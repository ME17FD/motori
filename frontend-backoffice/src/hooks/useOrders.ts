import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchOrders,
  fetchOrder,
  fetchRecentOrders,
  updateOrderStatus,
  updateOrderTracking,
} from '../services/orderService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { OrderFilters } from '../services/orderService';
import type { OrderStatus, UpdateTrackingRequest } from '../types/order';

/**
 * Paginated orders list from product-service.
 */
export function useOrders(params: OrderFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ordersSearch(params),
    queryFn: () => fetchOrders(params),
  });
}

/**
 * Single order by UUID.
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

/**
 * Recent orders for dashboard — fetches first page of orders.
 */
export function useRecentOrders(limit = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.ordersRecent(limit),
    queryFn: () => fetchRecentOrders(limit),
    refetchInterval: 60_000,
  });
}

export function useOrderMutations() {
  const qc = useQueryClient();

  const invalidate = (id?: string) => {
    qc.invalidateQueries({ queryKey: ['orders'] });
    if (id) qc.invalidateQueries({ queryKey: QUERY_KEYS.order(id) });
  };

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const updateTracking = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTrackingRequest }) =>
      updateOrderTracking(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  });

  return { updateStatus, updateTracking };
}