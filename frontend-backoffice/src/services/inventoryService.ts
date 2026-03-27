
/**
 * Inventory service — stock management endpoints.
 * Base path: /api/inventory (through API Gateway)
 */

import apiClient from '../api/axiosInstance';
import type {
  InventoryItemDto,
  CreateInventoryRequest,
  UpdatePaymentStatusRequest,
  InventoryFilters,
} from '../types/inventory';
import type { PageResult as PR } from '../types/product';

/** Fetch paginated inventory items with optional filters */
export async function fetchInventory(
  filters: InventoryFilters = {}
): Promise<PR<InventoryItemDto>> {
  const { data } = await apiClient.get<PR<InventoryItemDto>>(
    '/api/inventory',
    {
      params: {
        type:          filters.type,
        paymentStatus: filters.paymentStatus,
        available:     filters.available,
        productName:   filters.productName,
        page:          filters.page ?? 0,
        size:          filters.size ?? 20,
      },
    }
  );
  return data;
}

/** Add stock units for a product */
export async function addStock(
  payload: CreateInventoryRequest
): Promise<InventoryItemDto[]> {
  const { data } = await apiClient.post<InventoryItemDto[]>(
    '/api/inventory',
    payload
  );
  return data;
}

/** Mark an inventory item as sold */
export async function markAsSold(id: number): Promise<InventoryItemDto> {
  const { data } = await apiClient.patch<InventoryItemDto>(
    `/api/inventory/${id}/sell`
  );
  return data;
}

/** Update payment status of an inventory item */
export async function updatePaymentStatus(
  id: number,
  payload: UpdatePaymentStatusRequest
): Promise<InventoryItemDto> {
  const { data } = await apiClient.patch<InventoryItemDto>(
    `/api/inventory/${id}/payment`,
    payload
  );
  return data;
}

/** Delete an inventory item */
export async function deleteInventoryItem(id: number): Promise<void> {
  await apiClient.delete(`/api/inventory/${id}`);
}