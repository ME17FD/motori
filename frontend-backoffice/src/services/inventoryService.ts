import axiosInstance from '../api/axiosInstance';
import type { Inventory, InventoryRequest, InventoryFilters } from '../types/inventory';
import type { PagedModel } from '../types/api';

const BASE = '/api/products/inventories';

export async function fetchInventory(
  params: InventoryFilters = {},
): Promise<PagedModel<Inventory>> {
  const { data } = await axiosInstance.get<PagedModel<Inventory>>(BASE, { params });
  return data;
}

export async function fetchInventoryItem(id: string): Promise<Inventory> {
  const { data } = await axiosInstance.get<Inventory>(`${BASE}/${id}`);
  return data;
}

export async function createInventoryItem(
  payload: InventoryRequest,
): Promise<Inventory> {
  const { data } = await axiosInstance.post<Inventory>(BASE, payload);
  return data;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}