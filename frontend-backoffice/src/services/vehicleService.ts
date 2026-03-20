/**
 * Vehicle Service
 * API client for vehicle catalog management and queries.
 * Endpoints hit the /api/vehicles gateway endpoint.
 */

import axiosInstance from '../api/axiosInstance';
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '../types/vehicle';
import type { PageResponse, PageableParams } from '../types/api';

const BASE = '/api/vehicles';

/**
 * GET /api/vehicles - Fetch paginated vehicles list.
 */
export async function fetchVehicles(params: PageableParams = {}): Promise<PageResponse<Vehicle>> {
  const { data } = await axiosInstance.get<PageResponse<Vehicle>>(BASE, { params });
  return data;
}

export async function fetchVehicle(id: number): Promise<Vehicle> {
  const { data } = await axiosInstance.get<Vehicle>(`${BASE}/${id}`);
  return data;
}

export async function createVehicle(payload: CreateVehicleRequest): Promise<Vehicle> {
  const { data } = await axiosInstance.post<Vehicle>(BASE, payload);
  return data;
}

export async function updateVehicle(id: number, payload: UpdateVehicleRequest): Promise<Vehicle> {
  const { data } = await axiosInstance.put<Vehicle>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteVehicle(id: number): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}