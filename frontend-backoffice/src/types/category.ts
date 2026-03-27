/**
 * Category types — mirrors product-service category schemas.
 *
 * Two category types:
 *   PartCategory       — categories for spare parts
 *   EquipementCategory — categories for gear/equipment
 */

export type CategoryType = 'PartCategory' | 'EquipementCategory';

export interface CategoryDto {
  id: number;
  name: string;
  type: CategoryType;
  /** Parent category ID — null for root categories */
  parentId?: number | null;
  /** Nested children (populated when fetching tree) */
  children?: CategoryDto[];
}

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  parentId?: number | null;
}

export interface UpdateCategoryRequest {
  name: string;
  parentId?: number | null;
}