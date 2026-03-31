import type { UUID, ISODateString } from "./common.types";
import type { InventoryResponse } from "./inventory.types";

// ── Order status ──────────────────────────────────────────────────────────────

export const ORDER_STATUS = {
  PENDING:   "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ── API response ──────────────────────────────────────────────────────────────

export interface OrderItemResponse {
  readonly id: UUID;
  readonly inventory: InventoryResponse;
  readonly price: number;
}

export interface OrderResponse {
  readonly id: UUID;
  readonly userId: UUID;
  readonly totalPrice: number;
  readonly completed: boolean;
  readonly status: OrderStatus;
  readonly items: readonly OrderItemResponse[]; // readonly array — never mutate response
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ── API request bodies ────────────────────────────────────────────────────────

export interface OrderItemRequest {
  readonly inventoryId: UUID;
}

export interface OrderRequest {
  readonly items: readonly OrderItemRequest[]; // readonly array — built once, never mutated
}