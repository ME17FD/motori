/**
 * Vehicle types — mirrors product-service vehicle schemas.
 */
import type { BrandDto } from './brand';
export interface VehicleDto {
  id: string;
  name: string;
  model: string;
  brand: BrandDto;  // Nested brand object for easy access to brand name/type
  /** Brand ID — references a VehiculeBrand */
  vehiculeBrandId: string;
  /** Brand name (denormalized for display) */
  brandName?: string;
}

export interface CreateVehicleRequest {
  name: string;
  model: string;
  vehiculeBrandId: string;
}

export interface UpdateVehicleRequest {
  name: string;
  model: string;
  vehiculeBrandId: string;
}