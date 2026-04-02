/**
 * User role as defined by Spring Security.
 */
import type { UUID } from "./common.types";

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

/**
 * User entity from the auth/user service.
 */
export interface User {
  id: UUID;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  adress?: string;
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

/**
 * Request body for creating or updating a user.
 */
export interface UserPayload {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: UserRole[];
  enabled?: boolean;
}