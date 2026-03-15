/**
 * Vehicle entity — maps to the vehicle resource from product-service.
 */
export interface Vehicle {
  id: number;
  make: string;       // e.g. "Honda"
  model: string;      // e.g. "CBR 600"
  year: number;
  engine?: string;    // e.g. "600cc"
  type?: string;      // e.g. "Sport", "Trail"
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  engine?: string;
  type?: string;
}

export interface UpdateVehicleRequest {
  make?: string;
  model?: string;
  year?: number;
  engine?: string;
  type?: string;
}