export type UserRole = 'ADMIN' | 'USER' | 'SUPERADMIN';

/**
 * User entity — id is a string UUID.
 */
export interface User {
  id: string;          // ← string UUID
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles: UserRole[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  page?: number;
  size?: number;
  search?: string;
  role?: UserRole | '';
  enabled?: boolean;
  [key: string]: unknown;
}

export interface UpdateUserRequest {
  enabled?: boolean;
  roles?: UserRole[];
} 