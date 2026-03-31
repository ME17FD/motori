import type { UUID, ISODateString, PagedModel } from "./common.types";
import type { PartResponse } from "./part.types";
import type { VehiculeResponse } from "./vehicule.types";

// ── API response ──────────────────────────────────────────────────────────────

export interface CompatibilityResponse {
  readonly id: UUID;
  readonly part: PartResponse;
  readonly vehicule: VehiculeResponse;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// Named alias — avoids the inline anonymous type in the service
export type PagedCompatibility = PagedModel<CompatibilityResponse>;

// ── Query params ──────────────────────────────────────────────────────────────

export interface CompatibilityQueryParams {
  readonly vehiculeId?: UUID;
  readonly partId?: UUID;
  readonly page?: number;
  readonly size?: number;
}