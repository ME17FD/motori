/**
 * Brand types — mirrors product-service brand schemas.
 *
 * Three brand types exist in the system:
 *   VehiculeBrand  — motorcycle manufacturers (Honda, Yamaha…)
 *   PartBrand      — spare parts brands (NGK, Bosch…)
 *   EquipementBrand — equipment/gear brands (Alpinestars, Shoei…)
 */

export type BrandType = 'VehiculeBrand' | 'PartBrand' | 'EquipementBrand';

export interface BrandDto {
  id: number;
  name: string;
  type: BrandType;
  /** Soft-delete flag — true means brand is active */
  active?: boolean;
  /** True when data is served from Redis cache */
  cached?: boolean;
}

export interface CreateBrandRequest {
  name: string;
  type: BrandType;
}

export interface UpdateBrandRequest {
  name: string;
}