/**
 * useVehicles — TanStack Query hooks for vehicle endpoints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../services/catalogService';
import type { CreateVehicleRequest, UpdateVehicleRequest } from '../types/vehicle';

// ─── Query keys ────────────────────────────────────────────────────────────

export const vehicleKeys = {
  all:          ['vehicles'] as const,
  // vehiculeBrandId is now a string (UUID)
  list:         (vehiculeBrandId?: string) => ['vehicles', 'list', vehiculeBrandId] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Fetch all vehicles, optionally filtered by brand */
export function useVehicles(vehiculeBrandId?: string) {
  return useQuery({
    queryKey: vehicleKeys.list(vehiculeBrandId),
    queryFn:  () => fetchVehicles(vehiculeBrandId),
    staleTime: 5 * 60 * 1000,
  });
}

/** Create a vehicle */
export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehicleRequest) => createVehicle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      toast.success('Vehicle created.');
    },
    onError: () => toast.error('Failed to create vehicle.'),
  });
}

/** Update a vehicle */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    // id is now string (UUID)
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehicleRequest }) =>
      updateVehicle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      toast.success('Vehicle updated.');
    },
    onError: () => toast.error('Failed to update vehicle.'),
  });
}

/** Delete a vehicle */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      toast.success('Vehicle deleted.');
    },
    onError: () => toast.error('Failed to delete vehicle.'),
  });
}
