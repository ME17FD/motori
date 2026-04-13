import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchParts,
  fetchPart,
  createPart,
  updatePart,
  deletePart,
  uploadPartImage,
  deletePartImage,
  updatePartProperties,
  type PartFilters,
} from '../services/partService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PartRequest, PartUpdateRequest, DynamicProperties } from '../types/product';

export function useParts(params: PartFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.parts(params),
    queryFn: () => fetchParts(params),
  });
}

export function usePart(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.part(id),
    queryFn: () => fetchPart(id),
    enabled: !!id,
  });
}

export function usePartMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['parts'] });
  };

  const create = useMutation({
    mutationFn: (payload: PartRequest) => createPart(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PartUpdateRequest }) =>
      updatePart(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePart(id),
    onSuccess: invalidate,
  });

  const uploadImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadPartImage(id, file),
    onSuccess: invalidate,
  });

  const removeImage = useMutation({
    mutationFn: (id: string) => deletePartImage(id),
    onSuccess: invalidate,
  });

  const updateProperties = useMutation({
    mutationFn: ({ id, properties }: { id: string; properties: DynamicProperties }) =>
      updatePartProperties(id, properties),
    onSuccess: invalidate,
  });

  return { create, update, remove, uploadImage, removeImage, updateProperties };
}