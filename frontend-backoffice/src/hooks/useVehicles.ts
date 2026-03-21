import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVehicules,
  fetchVehicule,
  createVehicule,
  updateVehicule,
  deleteVehicule,
  fetchVehiculeBrands,
  createVehiculeBrand,
  updateVehiculeBrand,
  deleteVehiculeBrand,
} from '../services/vehicleService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { VehiculeRequest, VehiculeBrandRequest } from '../types/vehicle';
import type { PageableParams } from '../types/api';

export function useVehicules(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicules(params),
    queryFn: () => fetchVehicules(params),
  });
}

export function useVehicule(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicule(id),
    queryFn: () => fetchVehicule(id),
    enabled: !!id,
  });
}

export function useVehiculeBrands(params: PageableParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.vehiculeBrands(params),
    queryFn: () => fetchVehiculeBrands(params),
  });
}

export function useVehiculeMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['vehicules'] });
  };

  const create = useMutation({
    mutationFn: (payload: VehiculeRequest) => createVehicule(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VehiculeRequest }) =>
      updateVehicule(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteVehicule(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function useVehiculeBrandMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['vehicule-brands'] });
  };

  const create = useMutation({
    mutationFn: (payload: VehiculeBrandRequest) => createVehiculeBrand(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VehiculeBrandRequest }) =>
      updateVehiculeBrand(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteVehiculeBrand(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}