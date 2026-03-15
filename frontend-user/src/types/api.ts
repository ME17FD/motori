/**
 * Generic Spring Boot paginated response wrapper.
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
  sort: SortObject;
  pageable: PageableObject;
}

export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableObject {
  offset: number;
  pageSize: number;
  pageNumber: number;
  paged: boolean;
  unpaged: boolean;
  sort: SortObject;
}

/**
 * Query params for Spring Boot Pageable requests.
 * Index signature added so it's assignable to Record<string, unknown>
 * when used as a TanStack Query key.
 */
export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string[];
  [key: string]: unknown;   // index signature — required for query key compatibility
}

/**
 * Generic API error shape returned by the gateway.
 */
export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
  path?: string;
}