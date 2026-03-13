import axiosInstance from '../api/axiosInstance';
import type { Inventory, UpdateInventoryRequest, InventoryFilters } from '../types/inventory';
import type { PageResponse } from '../types/api';

const BASE = '/api/inventory';

/**
 * GET /api/inventory — paginated + filtered list.
 */
export async function fetchInventory(
  params: InventoryFilters = {},
): Promise<PageResponse<Inventory>> {
  const { data } = await axiosInstance.get<PageResponse<Inventory>>(BASE, { params });
  return data;
}

/**
 * GET /api/inventory/:id
 */
export async function fetchInventoryItem(id: number): Promise<Inventory> {
  const { data } = await axiosInstance.get<Inventory>(`${BASE}/${id}`);
  return data;
}

/**
 * GET /api/inventory/product/:productId
 */
export async function fetchInventoryByProduct(productId: number): Promise<Inventory> {
  const { data } = await axiosInstance.get<Inventory>(`${BASE}/product/${productId}`);
  return data;
}

/**
 * PATCH /api/inventory/:id
 */
export async function updateInventoryItem(
  id: number,
  payload: UpdateInventoryRequest,
): Promise<Inventory> {
  const { data } = await axiosInstance.patch<Inventory>(`${BASE}/${id}`, payload);
  return data;
}

/**
 * GET /api/inventory/low-stock — items below their threshold.
 */
export async function fetchLowStockItems(): Promise<Inventory[]> {
  const { data } = await axiosInstance.get<Inventory[]>(`${BASE}/low-stock`);
  return data;
}