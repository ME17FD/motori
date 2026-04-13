import type { UUID, ISODateString, PropertiesMap, PagedModel } from "./common.types";

// ── Enums ────────────────────────────────────────────────────────────────────

export const EQUIPEMENT_SIZES = {
  XS:  "XS",
  S:   "S",
  M:   "M",
  L:   "L",
  XL:  "XL",
  XXL: "XXL",
} as const;

// Derived union: "XS" | "S" | "M" | "L" | "XL" | "XXL"
export type EquipementSize = typeof EQUIPEMENT_SIZES[keyof typeof EQUIPEMENT_SIZES];

// ── Nested response shapes ────────────────────────────────────────────────────

export interface EquipementBrandResponse {
  readonly id: UUID;
  readonly name: string;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

export interface EquipementCategoryResponse {
  readonly id: UUID;
  readonly name: string;
  readonly parentCategoryId: UUID | null;
  readonly parentCategoryName: string | null;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ── API response ──────────────────────────────────────────────────────────────

export interface EquipementResponse {
  readonly id: UUID;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly size: EquipementSize;
  readonly color: string;
  readonly brand: EquipementBrandResponse;
  readonly category: EquipementCategoryResponse;
  readonly imageUrl: string;
  readonly properties: PropertiesMap;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
  readonly reference: string; // Added
  readonly stock: number; // Added
}

export type PagedEquipements = PagedModel<EquipementResponse>;

// ── API request body ──────────────────────────────────────────────────────────

export interface EquipementRequest {
  readonly name: string;
  readonly price: number;
  readonly size: EquipementSize;
  readonly color: string;
  readonly equipementBrandId: UUID;
  readonly equipementCategoryId: UUID;
  readonly description?: string;
  readonly properties?: PropertiesMap;
}

// ── Query params ──────────────────────────────────────────────────────────────
// `clothingSize` and `pageSize` avoid the `size` key collision at type level.
// mapQueryParams() resolves both to the correct API param name before sending.

export interface EquipementFilterParams {
  readonly name?: string;
  readonly brandId?: UUID;
  readonly categoryId?: UUID;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly clothingSize?: EquipementSize; // → mapped to `size` in API call
  readonly propertyKey?: string;
  readonly propertyValue?: string;
}

export interface EquipementPaginationParams {
  readonly page?: number;     // Default: 0
  readonly pageSize?: number; // Default: 20 → mapped to `size` in API call
}

// Composed query params — consumers use this type
export type EquipementQueryParams = EquipementFilterParams & EquipementPaginationParams;