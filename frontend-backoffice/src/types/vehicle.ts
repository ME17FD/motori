/**
 * Vehicle brand — maps to VehiculeBrandResponse from product-service.
 */
export interface VehiculeBrand {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Vehicle — maps to VehiculeResponse from product-service.
 * Each vehicle belongs to a VehiculeBrand.
 */
export interface Vehicule {
  id: string;
  model: string;
  name: string;
  brand: VehiculeBrand;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request body for creating or updating a vehicle.
 * vehiculeBrandId must be a valid VehiculeBrand UUID.
 */
export interface VehiculeRequest {
  model: string;
  name: string;
  vehiculeBrandId: string;
}

/**
 * Request body for creating or updating a vehicle brand.
 */
export interface VehiculeBrandRequest {
  name: string;
}