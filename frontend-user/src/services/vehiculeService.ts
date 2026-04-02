import apiClient from "../api/apiClient";
import { normalizePagedResponse } from "../api/normalizePagedResponse";
import { buildCleanParams } from "../utils/buildParams";
import type { PagedModel, UUID } from "../types/common.types";
import type { VehiculeBrandResponse, VehiculeResponse } from "../types/vehicule.types";
import type { SelectedVehicle } from "../types/vehicle.types";

const BRANDS_BASE = "/api/vehicule-brands" as const;
const VEHICULES_BASE = "/api/vehicules" as const;

const PAGE_SIZE = 100;

export const displayVehiculeModel = (v: VehiculeResponse): string => {
  const m = v.model?.trim();
  return m ? m : v.name;
};

export const vehiculeToSelectedVehicle = (v: VehiculeResponse): SelectedVehicle => ({
  id: v.id as UUID,
  brandName: v.brand.name,
  modelName: displayVehiculeModel(v),
});

export const getVehiculeBrands = async (
  page = 0,
  size = PAGE_SIZE
): Promise<PagedModel<VehiculeBrandResponse>> => {
  const { data } = await apiClient.get<unknown>(BRANDS_BASE, {
    params: buildCleanParams({ page, size }),
  });
  return normalizePagedResponse<VehiculeBrandResponse>(data);
};

export const getVehicules = async (
  page = 0,
  size = PAGE_SIZE
): Promise<PagedModel<VehiculeResponse>> => {
  const { data } = await apiClient.get<unknown>(VEHICULES_BASE, {
    params: buildCleanParams({ page, size }),
  });
  return normalizePagedResponse<VehiculeResponse>(data);
};

/**
 * Loads every brand (product-service paginates in memory; we still walk pages for consistency).
 */
export const getAllVehiculeBrands = async (): Promise<VehiculeBrandResponse[]> => {
  const out: VehiculeBrandResponse[] = [];
  let page = 0;
  while (true) {
    const p = await getVehiculeBrands(page, PAGE_SIZE);
    out.push(...p.content);
    if (page + 1 >= p.page.totalPages || p.content.length === 0) break;
    page++;
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Loads every vehicle row (Spring DB pagination — follow pages until complete).
 */
export const getAllVehicules = async (): Promise<VehiculeResponse[]> => {
  const out: VehiculeResponse[] = [];
  let page = 0;
  while (true) {
    const p = await getVehicules(page, PAGE_SIZE);
    out.push(...p.content);
    if (page + 1 >= p.page.totalPages || p.content.length === 0) break;
    page++;
  }
  return out;
};
