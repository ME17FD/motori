import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInventory,
  fetchInventoryItem,
  createInventoryItem,
  deleteInventoryItem,
} from '../services/inventoryService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { InventoryFilters, InventoryRequest } from '../types/inventory';

export function useInventory(params: InventoryFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.inventory(params),
    queryFn: () => fetchInventory(params),
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.inventoryItem(id),
    queryFn: () => fetchInventoryItem(id),
    enabled: !!id,
  });
}

export function useInventoryMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['inventory'] });
  };

  const create = useMutation({
    mutationFn: (payload: InventoryRequest) => createInventoryItem(payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: invalidate,
  });

  return { create, remove };
}