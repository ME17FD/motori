import type { UUID, ISODateString } from "./common.types";

export interface VehiculeBrandResponse {
  readonly id: UUID;
  readonly name: string;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

export interface VehiculeResponse {
  readonly id: UUID;
  readonly name: string;
  readonly model: string;
  readonly brand: VehiculeBrandResponse;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}