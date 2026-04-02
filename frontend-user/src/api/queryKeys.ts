import type { PartQueryParams } from "../types/part.types";
import type { EquipementQueryParams } from "../types/equipement.types";

/** Stable string for React Query cache identity (sorted keys). */
export function stableRecordKey(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/**
 * Hierarchical query keys — use these for every `useQuery` / invalidation.
 */
export const queryKeys = {
  parts: {
    all: ["parts"] as const,
    lists: () => [...queryKeys.parts.all, "list"] as const,
    list: (params: PartQueryParams) =>
      [...queryKeys.parts.lists(), stableRecordKey(params as unknown as Record<string, unknown>)] as const,
    details: () => [...queryKeys.parts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.parts.details(), id] as const,
  },
  equipements: {
    all: ["equipements"] as const,
    lists: () => [...queryKeys.equipements.all, "list"] as const,
    list: (params: EquipementQueryParams) =>
      [...queryKeys.equipements.lists(), stableRecordKey(params as unknown as Record<string, unknown>)] as const,
  },
  compatibility: {
    all: ["compatibility"] as const,
    partsByVehicle: (vehicleId: string) => [...queryKeys.compatibility.all, "vehicle", vehicleId] as const,
  },
  orders: {
    all: ["orders"] as const,
    byUser: (userId: string) => [...queryKeys.orders.all, "user", userId] as const,
  },
  categories: {
    all: ["part-categories"] as const,
    page: (page: number, size: number) => [...queryKeys.categories.all, page, size] as const,
  },
  vehiculeBrands: {
    all: ["vehicule-brands"] as const,
    list: () => [...queryKeys.vehiculeBrands.all, "list"] as const,
  },
  vehicules: {
    all: ["vehicules"] as const,
    list: () => [...queryKeys.vehicules.all, "list"] as const,
  },
} as const;
