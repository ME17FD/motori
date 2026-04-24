import apiClient from "../api/axiosInstance";
import { normalizePagedResponse } from "../api/normalizePagedResponse";
import { buildCleanParams } from "../utils/buildParams";
import type {
  InventoryResponse,
  InventoryQueryParams,
  PagedInventory,
} from "../types/inventory.types";
import type { UUID } from "../types/common.types";

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE = "/inventories" as const;

const INVENTORY_DEFAULTS: Required<Pick<InventoryQueryParams, "page" | "size">> = {
  page: 0,
  size: 20,
};

// ── GET /api/inventories ──────────────────────────────────────────────────────

export const getInventories = async (
  params: InventoryQueryParams = {}
): Promise<PagedInventory> => {
  const { data } = await apiClient.get<unknown>(BASE, {
    params: buildCleanParams(params, INVENTORY_DEFAULTS),
  });
  return normalizePagedResponse<InventoryResponse>(data);
};

// ── GET /api/inventories/:id ──────────────────────────────────────────────────

export const getInventoryById = async (id: UUID): Promise<InventoryResponse> => {
  const { data } = await apiClient.get<InventoryResponse>(`${BASE}/${id}`);
  return data;
};