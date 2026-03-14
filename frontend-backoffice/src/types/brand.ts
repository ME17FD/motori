/**
 * Brand entity — maps to the brand resource from product-service.
 */
export interface Brand {
  id: number;
  name: string;
  slug?: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBrandRequest {
  name: string;
  slug?: string;
}

export interface UpdateBrandRequest {
  name?: string;
  slug?: string;
}