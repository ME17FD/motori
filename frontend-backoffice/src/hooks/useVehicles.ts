/**
 * Vehicles Hook
 * Provides TanStack Query hooks for vehicle catalog queries and mutations.
 * Handles paginated vehicle list, single vehicle detail, and CRUD operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVehicles, fetchVehicle,
  createVehicle, updateVehicle, deleteVehicle,
} from '../services/vehicleService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PageableParams } from '../types/api';
import type { CreateVehicleRequest, UpdateVehicleRequest } from '../types/vehicle';

/**
 * Fetch vehicles with pagination and filtering.
 * @param params - Pagination and filter parameters
 * @returns Query result with vehicles array and metadata
 */
export function useVehicles(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicles(params),
    queryFn: () => fetchVehicles(params),
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicle(id),
    queryFn: () => fetchVehicle(id),
    enabled: id > 0,
  });
}

export function useVehicleMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['vehicles'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateVehicleRequest) => createVehicle(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVehicleRequest }) =>
      updateVehicle(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteVehicle(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}