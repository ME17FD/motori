/**
 * useInventory — TanStack Query hooks for inventory endpoints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchInventory,
  addStock,
  markAsSold,
  updatePaymentStatus,
  deleteInventoryItem,
} from '../services/inventoryService';
import type {
  InventoryFilters,
  CreateInventoryRequest,
  UpdatePaymentStatusRequest,
} from '../types/inventory';

// ─── Query keys ────────────────────────────────────────────────────────────

export const inventoryKeys = {
  all:   ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list:  (f: InventoryFilters) => [...inventoryKeys.lists(), f] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Paginated inventory list with filters */
export function useInventory(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn:  () => fetchInventory(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** Add stock units */
export function useAddStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInventoryRequest) => addStock(payload),
    onSuccess: (items) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success(`${items.length} stock unit(s) added.`);
    },
    onError: () => toast.error('Failed to add stock.'),
  });
}

/** Mark item as sold */
export function useMarkAsSold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markAsSold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success('Item marked as sold.');
    },
    onError: () => toast.error('Failed to mark as sold.'),
  });
}

/** Update payment status */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdatePaymentStatusRequest;
    }) => updatePaymentStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success('Payment status updated.');
    },
    onError: () => toast.error('Failed to update payment status.'),
  });
}

/** Delete inventory item */
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success('Inventory item removed.');
    },
    onError: () => toast.error('Failed to remove item.'),
  });
}