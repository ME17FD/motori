/**
 * Spring HATEOAS PagedModel — response shape from product-service.
 * Used for all product-service paginated endpoints.
 */
export interface PagedModel<T> {
  content: T[];
  page: PageMetadata;
}

export interface PageMetadata {
  size: number;
  number: number;        // current page index (0-based)
  totalElements: number;
  totalPages: number;
}

/**
 * Spring Boot standard Page<T> — response shape from backoffice-service.
 * Used for orders, statistics endpoints.
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
}

/**
 * Query params for Spring Boot Pageable requests.
 * Index signature required for TanStack Query key compatibility.
 */
export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string[];
  [key: string]: unknown;
}

/**
 * Generic API error shape returned by the gateway.
 */
export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
  path?: string;
  requestId?: string;
}