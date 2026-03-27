/**
 * Vehicle types — mirrors product-service vehicle schemas.
 */

export interface VehicleDto {
  id: number;
  name: string;
  model: string;
  /** Brand ID — references a VehiculeBrand */
  brandId: number;
  /** Brand name (denormalized for display) */
  brandName?: string;
}

export interface CreateVehicleRequest {
  name: string;
  model: string;
  brandId: number;
}

export interface UpdateVehicleRequest {
  name: string;
  model: string;
  brandId: number;
}