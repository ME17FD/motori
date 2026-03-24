import axiosInstance from '../api/axiosInstance';
import type {
  Vehicule,
  VehiculeRequest,
  VehiculeBrand,
  VehiculeBrandRequest,
} from '../types/vehicle';
import type { PagedModel, PageableParams } from '../types/api';

const VEHICULES_BASE = '/api/products/vehicules';
const BRANDS_BASE    = '/api/products/vehicule-brands';

/* ── Vehicules ── */

/**
 * GET /api/products/vehicules — paginated list.
 */
export async function fetchVehicules(
  params: PageableParams = {},
): Promise<PagedModel<Vehicule>> {
  const { data } = await axiosInstance.get<PagedModel<Vehicule>>(VEHICULES_BASE, { params });
  return data;
}

export async function fetchVehicule(id: string): Promise<Vehicule> {
  const { data } = await axiosInstance.get<Vehicule>(`${VEHICULES_BASE}/${id}`);
  return data;
}

export async function createVehicule(payload: VehiculeRequest): Promise<Vehicule> {
  const { data } = await axiosInstance.post<Vehicule>(VEHICULES_BASE, payload);
  return data;
}

export async function updateVehicule(
  id: string,
  payload: VehiculeRequest,
): Promise<Vehicule> {
  const { data } = await axiosInstance.put<Vehicule>(`${VEHICULES_BASE}/${id}`, payload);
  return data;
}

export async function deleteVehicule(id: string): Promise<void> {
  await axiosInstance.delete(`${VEHICULES_BASE}/${id}`);
}

/* ── Vehicule brands ── */

/**
 * GET /api/products/vehicule-brands — paginated list.
 */
export async function fetchVehiculeBrands(
  params: PageableParams = {},
): Promise<PagedModel<VehiculeBrand>> {
  const { data } = await axiosInstance.get<PagedModel<VehiculeBrand>>(BRANDS_BASE, { params });
  return data;
}

export async function fetchVehiculeBrand(id: string): Promise<VehiculeBrand> {
  const { data } = await axiosInstance.get<VehiculeBrand>(`${BRANDS_BASE}/${id}`);
  return data;
}

export async function createVehiculeBrand(
  payload: VehiculeBrandRequest,
): Promise<VehiculeBrand> {
  const { data } = await axiosInstance.post<VehiculeBrand>(BRANDS_BASE, payload);
  return data;
}

export async function updateVehiculeBrand(
  id: string,
  payload: VehiculeBrandRequest,
): Promise<VehiculeBrand> {
  const { data } = await axiosInstance.put<VehiculeBrand>(`${BRANDS_BASE}/${id}`, payload);
  return data;
}

export async function deleteVehiculeBrand(id: string): Promise<void> {
  await axiosInstance.delete(`${BRANDS_BASE}/${id}`);
}