/**
 * Category types — mirrors product-service category schemas.
 *
 * Two category types:
 *   PartCategory       — categories for spare parts
 *   EquipementCategory — categories for gear/equipment
 */

export type CategoryType = 'PartCategory' | 'EquipementCategory';

export interface CategoryDto {
  id: string;
  name: string;
  type?: CategoryType;
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  createdAt?: string;
  updatedAt?: string;
  children?: CategoryDto[];
}

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  parentCategoryId?: string | null;
}

export interface UpdateCategoryRequest {
  name: string;
  parentCategoryId?: string | null;
}