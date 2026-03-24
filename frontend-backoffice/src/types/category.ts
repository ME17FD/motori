/**
 * Category for parts — maps to PartCategoryResponse.
 * Supports parent/child hierarchy via parentCategoryId.
 */
export interface PartCategory {
  id: string;
  name: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Category for equipment — maps to EquipementCategoryResponse.
 */
export interface EquipementCategory {
  id: string;
  name: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request body for creating or updating a part category.
 */
export interface PartCategoryRequest {
  name: string;
  parentCategoryId?: string;
}

/**
 * Request body for creating or updating an equipment category.
 */
export interface EquipementCategoryRequest {
  name: string;
  parentCategoryId?: string;
}