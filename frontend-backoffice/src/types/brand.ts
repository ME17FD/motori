/**
 * Brand for parts (pièces moto) — maps to PartBrandResponse.
 * ID is a UUID string from product-service.
 */
export interface PartBrand {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Brand for equipment (équipements moto) — maps to EquipementBrandResponse.
 */
export interface EquipementBrand {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request body for creating or updating a part brand.
 */
export interface PartBrandRequest {
  name: string;
}

/**
 * Request body for creating or updating an equipment brand.
 */
export interface EquipementBrandRequest {
  name: string;
}