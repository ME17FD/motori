/**
 * Category entity — maps to the category resource from product-service.
 */
export interface Category {
  id: number;
  name: string;
  slug?: string;
  parentId?: number;
  parentName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  parentId?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: number;
}