/**
 * User role as defined by Spring Security.
 */
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

/**
 * User entity from the auth/user service.
 */
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles: UserRole[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filters for the users list.
 */
export interface UserFilters {
  page?: number;
  size?: number;
  search?: string;
  role?: UserRole | '';
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * Request body for updating a user's status or roles.
 */
export interface UpdateUserRequest {
  enabled?: boolean;
  roles?: UserRole[];
}