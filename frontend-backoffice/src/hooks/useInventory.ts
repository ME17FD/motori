import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInventory,
  fetchInventoryItem,
  fetchInventoryByProduct,
  updateInventoryItem,
  fetchLowStockItems,
} from '../services/inventoryService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { InventoryFilters, UpdateInventoryRequest } from '../types/inventory';

/**
 * Paginated inventory list with filters.
 */
export function useInventory(params: InventoryFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.inventory(params),
    queryFn: () => fetchInventory(params),
  });
}

/**
 * Single inventory item by id.
 */
export function useInventoryItem(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.inventoryItem(id),
    queryFn: () => fetchInventoryItem(id),
    enabled: id > 0,
  });
}

/**
 * Inventory entry linked to a specific product.
 */
export function useInventoryByProduct(productId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.inventoryProduct(productId),
    queryFn: () => fetchInventoryByProduct(productId),
    enabled: productId > 0,
  });
}

/**
 * All items below their low-stock threshold.
 * Refreshes every 2 minutes to surface alerts quickly.
 */
export function useLowStockItems() {
  return useQuery({
    queryKey: QUERY_KEYS.lowStock(),
    queryFn: fetchLowStockItems,
    refetchInterval: 120_000,
  });
}

/**
 * Mutation for updating quantity, availability and status.
 */
export function useInventoryMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['inventory'] });
  };

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateInventoryRequest }) =>
      updateInventoryItem(id, payload),
    onSuccess: invalidate,
  });

  return { update };
}