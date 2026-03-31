import type { UUID, ISODateString, PagedModel } from "./common.types";
import type { PartResponse } from "./part.types";
import type { EquipementResponse } from "./equipement.types";

// ── Const objects (erasable) ──────────────────────────────────────────────────

export const PAYMENT_STATUS = {
  PENDING:   "PENDING",
  PAID:      "PAID",
  CANCELLED: "CANCELLED",
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const INVENTORY_TYPE = {
  PART:      "PART",
  EQUIPMENT: "EQUIPMENT",
} as const;

export type InventoryType = typeof INVENTORY_TYPE[keyof typeof INVENTORY_TYPE];

// ── Discriminated union ───────────────────────────────────────────────────────
// Instead of a single interface with two nullable fields,
// use a proper discriminated union on `type`.
// TypeScript narrows automatically on `item.type` — no manual type guards needed.

interface InventoryBase {
  readonly id: UUID;
  readonly paymentStatus: PaymentStatus;
  readonly soldAt: ISODateString | null;
  readonly expiredAt: ISODateString | null;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

export interface PartInventoryResponse extends InventoryBase {
  readonly type: "PART";
  readonly part: PartResponse;
  readonly equipement: null;
}

export interface EquipementInventoryResponse extends InventoryBase {
  readonly type: "EQUIPMENT";
  readonly part: null;
  readonly equipement: EquipementResponse;
}

// The union — use this everywhere instead of the base
export type InventoryResponse = PartInventoryResponse | EquipementInventoryResponse;

// Convenience alias
export type PagedInventory = PagedModel<InventoryResponse>;

// ── Query params ──────────────────────────────────────────────────────────────

export interface InventoryFilterParams {
  readonly available?: boolean;
  readonly paymentStatus?: PaymentStatus;
  readonly type?: InventoryType;
}

export interface InventoryPaginationParams {
  readonly page?: number;   // Default: 0
  readonly size?: number;   // Default: 20
}

export type InventoryQueryParams = InventoryFilterParams & InventoryPaginationParams;