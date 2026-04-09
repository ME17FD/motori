/**
 * Product types — mirrors product-service schemas for parts and equipment.
 *
 * Both Part and Equipement share a common base (Article) with
 * type-specific fields added on top.
 */

// ─── Shared ────────────────────────────────────────────────────────────────

export type ProductStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

/** Dynamic JSON properties stored as JSONB in PostgreSQL */
export type DynamicProperties = Record<string, string | number | boolean>;

/** Base fields shared by both Part and Equipement */
export interface ArticleBase {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  status: ProductStatus;
  stock: number;
  createdAt: string;
  properties?: DynamicProperties;
}

// ─── Part ──────────────────────────────────────────────────────────────────

export interface PartDto extends ArticleBase {
  ref: string;
  partBrandId: string;
  partBrandName?: string;
  partCategoryId: string;
  partCategoryName?: string;
  /** IDs of compatible vehicles */
  compatibleVehicleIds?: string[];
}

export interface CreatePartRequest {
  name: string;
  description?: string;
  price: number;
  ref: string;
  partBrandId: string;
  partCategoryId: string;
  status?: ProductStatus;
  stock?: number;
  properties?: DynamicProperties;
  compatibleVehicleIds?: string[];
  imageUrl?: string;
}

export interface UpdatePartRequest extends Partial<CreatePartRequest> {}

// ─── Equipement ────────────────────────────────────────────────────────────

export type EquipementSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface EquipementDto extends ArticleBase {
  equipementBrandId: string;
  brandName?: string;
  equipementCategoryId: string;
  categoryName?: string;
  size?: EquipementSize;
  color?: string;
}

export interface CreateEquipementRequest {
  name: string;
  description?: string;
  price: number;
  equipementBrandId: string;
  equipementCategoryId: string;
  status?: ProductStatus;
  stock?: number;
  size?: EquipementSize;
  color?: string;
  properties?: DynamicProperties;
  imageUrl?: string;
}

export interface UpdateEquipementRequest extends Partial<CreateEquipementRequest> {}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ─── Filters ───────────────────────────────────────────────────────────────

export interface ProductFilters {
  name?: string;
  // Part filters (UUID strings, not numbers)
  partBrandId?: string;
  partCategoryId?: string;
  // Equipment filters
  equipementBrandId?: string;
  equipementCategoryId?: string;
  // Common
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  page?: number;
  size?: number;
  sort?: string[];
}