import apiClient from "../api/apiClient";
import { normalizePagedResponse } from "../api/normalizePagedResponse";
import { mapEquipementParams } from "../utils/equipementParams";
import type {
  EquipementResponse,
  EquipementRequest,
  EquipementQueryParams,
  PagedEquipements,
} from "../types/equipement.types";
import type { UUID } from "../types/common.types";

const BASE = "/api/equipements" as const;

// ── GET /api/equipements ──────────────────────────────────────────────────────

export const getEquipements = async (
  params: EquipementQueryParams = {}
): Promise<PagedEquipements> => {
  const { data } = await apiClient.get<unknown>(BASE, {
    params: mapEquipementParams(params),
  });
  return normalizePagedResponse<EquipementResponse>(data);
};

// ── GET /api/equipements/:id ──────────────────────────────────────────────────

export const getEquipementById = async (id: UUID): Promise<EquipementResponse> => {
  const { data } = await apiClient.get<EquipementResponse>(`${BASE}/${id}`);
  return data;
};

// ── POST /api/equipements ─────────────────────────────────────────────────────

export const createEquipement = async (
  payload: EquipementRequest
): Promise<EquipementResponse> => {
  const { data } = await apiClient.post<EquipementResponse>(BASE, payload);
  return data;
};

// ── PUT /api/equipements/:id ──────────────────────────────────────────────────

export const updateEquipement = async (
  id: UUID,
  payload: EquipementRequest
): Promise<EquipementResponse> => {
  const { data } = await apiClient.put<EquipementResponse>(
    `${BASE}/${id}`,
    payload
  );
  return data;
};

// ── DELETE /api/equipements/:id ───────────────────────────────────────────────

export const deleteEquipement = async (id: UUID): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`);
};

// ── POST /api/equipements/:id/image ───────────────────────────────────────────
// Content-Type is intentionally set to multipart/form-data so axios
// includes the correct boundary in the header automatically.

export const uploadEquipementImage = async (
  id: UUID,
  file: File
): Promise<EquipementResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post<EquipementResponse>(
    `${BASE}/${id}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

// ── DELETE /api/equipements/:id/image ─────────────────────────────────────────

export const deleteEquipementImage = async (id: UUID): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}/image`);
};