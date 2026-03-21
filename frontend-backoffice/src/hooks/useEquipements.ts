import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEquipements,
  fetchEquipement,
  createEquipement,
  updateEquipement,
  deleteEquipement,
  uploadEquipementImage,
  deleteEquipementImage,
  updateEquipementProperties,
  type EquipementFilters,
} from '../services/equipementService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { EquipementRequest, EquipementUpdateRequest, DynamicProperties } from '../types/product';

export function useEquipements(params: EquipementFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.equipements(params),
    queryFn: () => fetchEquipements(params),
  });
}

export function useEquipement(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.equipement(id),
    queryFn: () => fetchEquipement(id),
    enabled: !!id,
  });
}

export function useEquipementMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['equipements'] });
  };

  const create = useMutation({
    mutationFn: (payload: EquipementRequest) => createEquipement(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EquipementUpdateRequest }) =>
      updateEquipement(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEquipement(id),
    onSuccess: invalidate,
  });

  const uploadImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadEquipementImage(id, file),
    onSuccess: invalidate,
  });

  const removeImage = useMutation({
    mutationFn: (id: string) => deleteEquipementImage(id),
    onSuccess: invalidate,
  });

  const updateProperties = useMutation({
    mutationFn: ({ id, properties }: { id: string; properties: DynamicProperties }) =>
      updateEquipementProperties(id, properties),
    onSuccess: invalidate,
  });

  return { create, update, remove, uploadImage, removeImage, updateProperties };
}