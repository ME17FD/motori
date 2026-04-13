import type { PartBrand, EquipementBrand } from './brand';
import type { PartCategory, EquipementCategory } from './category';

/**
 * Dynamic properties stored as JSONB in PostgreSQL.
 * Keys and value types are arbitrary — defined per product category.
 */
export type DynamicProperties = Record<string, unknown>;

/**
 * Available sizes for equipment items.
 */
export type EquipementSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

/**
 * Moto part — maps to PartResponse from product-service.
 * Soft-deletable — deleted items are hidden but not removed from DB.
 */
export interface Part {
  id: string;
  name: string;
  ref: string;           // unique part reference code
  description?: string;
  price: number;
  brand: PartBrand;
  category: PartCategory;
  imageUrl?: string;     // Minio URL
  properties?: DynamicProperties;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Moto equipment — maps to EquipementResponse from product-service.
 * Soft-deletable — deleted items are hidden but not removed from DB.
 */
export interface Equipement {
  id: string;
  name: string;
  size: EquipementSize;
  color: string;
  description?: string;
  price: number;
  brand: EquipementBrand;
  category: EquipementCategory;
  imageUrl?: string;     // Minio URL
  properties?: DynamicProperties;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request body for creating a part.
 * ref must be unique across all parts.
 */
export interface PartRequest {
  name: string;
  ref: string;
  description?: string;
  price: number;
  partBrandId: string;
  partCategoryId: string;
  properties?: DynamicProperties;
}

/**
 * Request body for updating a part — all fields optional.
 */
export type PartUpdateRequest = Partial<PartRequest>;

/**
 * Request body for creating an equipment item.
 */
export interface EquipementRequest {
  name: string;
  size: EquipementSize;
  color: string;
  description?: string;
  price: number;
  equipementBrandId: string;
  equipementCategoryId: string;
  properties?: DynamicProperties;
}

/**
 * Request body for updating an equipment item — all fields optional.
 */
export type EquipementUpdateRequest = Partial<EquipementRequest>;

/**
 * A single dynamic property field used by the form builder UI.
 */
export interface PropertyField {
  key: string;
  value: string;
}