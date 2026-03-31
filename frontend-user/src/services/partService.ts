import axiosInstance from "../api/axiosInstance";
import { buildCleanParams } from "../utils/buildParams";
import type {
  PartResponse,
  PartRequest,
  PartPropertiesPatch,
  PartQueryParams,
  PagedParts,
} from "../types/part.types";

// Default pagination values — single source of truth
const PART_DEFAULTS: Required<Pick<PartQueryParams, "page" | "size">> = {
  page: 0,
  size: 20,
};

const BASE = "/api/parts" as const;

// ── GET /api/parts ──────────────────────────────────────────────────────────
export const getParts = async (
  params: PartQueryParams = {}
): Promise<PagedParts> => {
  const { data } = await axiosInstance.get<PagedParts>(BASE, {
    params: buildCleanParams(params, PART_DEFAULTS),
  });
  return data;
};

// ── GET /api/parts/:id ──────────────────────────────────────────────────────
export const getPartById = async (id: string): Promise<PartResponse> => {
  const { data } = await axiosInstance.get<PartResponse>(`${BASE}/${id}`);
  return data;
};

// ── POST /api/parts ─────────────────────────────────────────────────────────
export const createPart = async (payload: PartRequest): Promise<PartResponse> => {
  const { data } = await axiosInstance.post<PartResponse>(BASE, payload);
  return data;
};

// ── PUT /api/parts/:id ──────────────────────────────────────────────────────
export const updatePart = async (
  id: string,
  payload: PartRequest
): Promise<PartResponse> => {
  const { data } = await axiosInstance.put<PartResponse>(`${BASE}/${id}`, payload);
  return data;
};

// ── DELETE /api/parts/:id ───────────────────────────────────────────────────
export const deletePart = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE}/${id}`);
};

// ── POST /api/parts/:id/image ───────────────────────────────────────────────
export const uploadPartImage = async (
  id: string,
  file: File
): Promise<PartResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await axiosInstance.post<PartResponse>(
    `${BASE}/${id}/image`,
    formData,
    // Omit Content-Type — axios sets multipart/form-data + boundary automatically
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

// ── DELETE /api/parts/:id/image ─────────────────────────────────────────────
export const deletePartImage = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE}/${id}/image`);
};

// ── PATCH /api/parts/:id/properties ────────────────────────────────────────
export const patchPartProperties = async (
  id: string,
  payload: PartPropertiesPatch
): Promise<PartResponse> => {
  const { data } = await axiosInstance.patch<PartResponse>(
    `${BASE}/${id}/properties`,
    payload
  );
  return data;
};