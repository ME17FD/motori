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
<<<<<<< HEAD:frontend/src/types/user.ts
=======
 * Request body for creating a new user.
 */
export interface UserCreatePayload {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  adress?: string;
  approved?: boolean;
  activated?: boolean;
}

/**
 * Request body for updating a user.
 */
export interface UserUpdatePayload {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  adress?: string;
}

/**
>>>>>>> frontend:frontend-user/src/types/user.ts
 * Request body for updating a user's status or roles.
 */
export interface UpdateUserRequest {
  enabled?: boolean;
  roles?: UserRole[];
}