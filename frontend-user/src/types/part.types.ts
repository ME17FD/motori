import type { UUID, ISODateString, PropertiesMap, PagedModel } from "./common.types";

// ── Nested response shapes ──────────────────────────────────────────────────

export interface PartBrandResponse {
  readonly id: UUID;
  readonly name: string;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

export interface PartCategoryResponse {
  readonly id: UUID;
  readonly name: string;
  readonly parentCategoryId: UUID | null;
  readonly parentCategoryName: string | null;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ── API response ────────────────────────────────────────────────────────────

export interface PartResponse {
  readonly id: UUID;
  readonly name: string;
  readonly ref: string;
  readonly description: string;
  readonly price: number;
  readonly brand: PartBrandResponse;
  readonly category: PartCategoryResponse;
  readonly imageUrl: string | null;
  readonly properties: PropertiesMap;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
  readonly image: string; // Added
  readonly dimensions?: string; // Added
  readonly stock: number; // Added
}

// Convenience alias — used by hooks and components
export type PagedParts = PagedModel<PartResponse>;

// ── API request bodies ──────────────────────────────────────────────────────

export interface PartRequest {
  readonly name: string;
  readonly ref: string;
  readonly price: number;
  readonly partBrandId: UUID;
  readonly partCategoryId: UUID;
  readonly description?: string;
  readonly properties?: PropertiesMap;
  // Server-side property search helpers (used in PUT/POST search context)
  readonly propertyKey?: string;
  readonly propertyValue?: string;
  readonly hasProperty?: string;
  readonly propertiesSearch?: string;
}

export interface PartPropertiesPatch {
  readonly properties: PropertiesMap;
}

// ── Query params for GET /api/parts ────────────────────────────────────────

export interface PartQueryParams {
  readonly name?: string;
  readonly brandId?: UUID;
  readonly categoryId?: UUID;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly vehiculeId?: UUID;      // Filters by vehicle compatibility
  readonly propertyKey?: string;
  readonly propertyValue?: string;
  readonly hasProperty?: string;
  readonly propertiesSearch?: string;
  readonly page?: number;          // Default: 0
  readonly size?: number;          // Default: 20
}