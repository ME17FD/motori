// Shared pagination types — reused across ALL paged services (parts, equipment, orders…)

export interface PageMetadata {
  readonly size: number;
  readonly number: number;
  readonly totalElements: number;
  readonly totalPages: number;
}

export interface PagedModel<T> {
  readonly content: T[];
  readonly page: PageMetadata;
}

// Generic UUID alias — improves readability and intent across all types
export type UUID = string & { readonly __brand: "UUID" };

// Generic ISO date string alias
export type ISODateString = string & { readonly __brand: "ISODateString" };

// Generic dynamic properties bag used by parts & equipment
export type PropertiesMap = Record<string, unknown>;