/**
 * Dynamic property stored as JSONB in PostgreSQL.
 */
export type DynamicProperties = Record<string, string | number | boolean>;

/**
 * Product type discriminator.
 */
export type ProductType = 'PART' | 'EQUIPMENT';

/**
 * Full product entity.
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  productType: ProductType;
  brandId?: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  imageUrls: string[];
  properties?: DynamicProperties;
  compatibleVehicleIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  productType: ProductType;
  brandId?: number;
  categoryId?: number;
  properties?: DynamicProperties;
  compatibleVehicleIds?: number[];
}

/**
 * Use type alias instead of empty interface extending another interface.
 * An interface with no additional members is identical to its supertype.
 */
export type UpdateProductRequest = Partial<CreateProductRequest>;

/**
 * A single dynamic property field used by the form builder.
 */
export interface PropertyField {
  key: string;
  value: string;
}