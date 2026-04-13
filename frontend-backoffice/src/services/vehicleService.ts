import axiosInstance from '../api/axiosInstance';
import type {
  VehicleDto,
  CreateVehicleRequest,
  UpdateVehicleRequest,
} from '../types/vehicle';
// Vehicle brands reuse the generic BrandDto and BrandType from the brand types
import type { BrandDto, CreateBrandRequest, UpdateBrandRequest } from '../types/brand';
import type { PagedModel, PageableParams } from '../types/api';

const VEHICULES_BASE = '/api/products/vehicules';
const BRANDS_BASE    = '/api/products/vehicule-brands';

/* ── Vehicules (vehicles) ── */

export async function fetchVehicules(
  params: PageableParams = {},
): Promise<PagedModel<VehicleDto>> {
  const { data } = await axiosInstance.get<PagedModel<VehicleDto>>(VEHICULES_BASE, { params });
  return data;
}

export async function fetchVehicule(id: string): Promise<VehicleDto> {
  const { data } = await axiosInstance.get<VehicleDto>(`${VEHICULES_BASE}/${id}`);
  return data;
}

export async function createVehicule(payload: CreateVehicleRequest): Promise<VehicleDto> {
  // Send exactly what the backend expects: vehiculeBrandId (UUID string)
  const cleanedPayload = {
    name: payload.name,
    model: payload.model,
    vehiculeBrandId: payload.vehiculeBrandId,   // already a string, no conversion needed
  };
  const { data } = await axiosInstance.post<VehicleDto>(VEHICULES_BASE, cleanedPayload);
  return data;
}

export async function updateVehicule(
  id: string,
  payload: UpdateVehicleRequest,
): Promise<VehicleDto> {
  const cleanedPayload = {
    name: payload.name,
    model: payload.model,
    vehiculeBrandId: payload.vehiculeBrandId,
  };
  const { data } = await axiosInstance.put<VehicleDto>(`${VEHICULES_BASE}/${id}`, cleanedPayload);
  return data;
}

export async function deleteVehicule(id: string): Promise<void> {
  await axiosInstance.delete(`${VEHICULES_BASE}/${id}`);
}

/* ── Vehicule brands ── */
// A VehiculeBrand is just a BrandDto with type = 'VehiculeBrand'
// We use BrandDto for responses and CreateBrandRequest / UpdateBrandRequest for payloads.

export async function fetchVehiculeBrands(
  params: PageableParams = {},
): Promise<PagedModel<BrandDto>> {
  const { data } = await axiosInstance.get<PagedModel<BrandDto>>(BRANDS_BASE, { params });
  return data;
}

export async function fetchVehiculeBrand(id: string): Promise<BrandDto> {
  const { data } = await axiosInstance.get<BrandDto>(`${BRANDS_BASE}/${id}`);
  return data;
}

export async function createVehiculeBrand(
  payload: CreateBrandRequest,
): Promise<BrandDto> {
  // Ensure the type is 'VehiculeBrand' (caller must set it)
  const { data } = await axiosInstance.post<BrandDto>(BRANDS_BASE, payload);
  return data;
}

export async function updateVehiculeBrand(
  id: string,
  payload: UpdateBrandRequest,
): Promise<BrandDto> {
  const { data } = await axiosInstance.put<BrandDto>(`${BRANDS_BASE}/${id}`, payload);
  return data;
}

export async function deleteVehiculeBrand(id: string): Promise<void> {
  await axiosInstance.delete(`${BRANDS_BASE}/${id}`);
}